/**
 * Anthropic API共通クライアント
 * 全APIルートはこのモジュール経由でClaudeを呼び出す
 */

import {
  NOA_TAROT_SYSTEM_PROMPT,
  NOA_SPREAD_SYSTEM_PROMPT,
} from '@/lib/prompts';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{ text: string }>;
}

/** 共通のClaude API呼び出し */
export async function callClaude(options: {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const {
    system,
    messages,
    maxTokens = 600,
    model = 'claude-haiku-4-5-20251001',
  } = options;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY 環境変数が設定されていません。Vercel の Environment Variables または .env.local に設定してください。'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data: ClaudeResponse = await response.json();
    return data.content[0].text;
  } finally {
    clearTimeout(timeout);
  }
}

/** タロット1枚引き */
export async function getReading(
  card: {
    name: string;
    nameEn: string;
    isReversed: boolean;
    keywords: string[];
  },
  question: string
): Promise<string> {
  return callClaude({
    system: NOA_TAROT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `【質問】${question}\n【カード】${card.name}（${card.nameEn}）${card.isReversed ? '逆位置' : '正位置'}\n【キーワード】${card.keywords.join('、')}`,
      },
    ],
    maxTokens: 600,
  });
}

export interface SpreadCard {
  name: string;
  nameEn: string;
  isReversed: boolean;
  keywords: string[];
  position: string;
}

/** タロット3枚スプレッド */
export async function getSpreadReading(
  cards: SpreadCard[],
  question: string
): Promise<string> {
  const cardsText = cards
    .map(
      (c) =>
        `【${c.position}】${c.name}（${c.nameEn}）${c.isReversed ? '逆位置' : '正位置'}　キーワード: ${c.keywords.join('、')}`
    )
    .join('\n');

  return callClaude({
    system: NOA_SPREAD_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `【質問】${question}\n${cardsText}`,
      },
    ],
    maxTokens: 800,
  });
}
