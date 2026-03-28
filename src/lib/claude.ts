/**
 * Anthropic API共通クライアント
 * 全APIルートはこのモジュール経由でClaudeを呼び出す
 */

import Anthropic from '@anthropic-ai/sdk';

import {
  NOA_TAROT_SYSTEM_PROMPT,
  NOA_SPREAD_SYSTEM_PROMPT,
} from '@/lib/prompts';

// --- Anthropic SDK client (singleton) ---
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY 環境変数が設定されていません。Vercel の Environment Variables または .env.local に設定してください。'
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

const MODEL = 'claude-haiku-4-5-20251001';

// --- 型定義 ---
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// --- callClaude: 汎用の非ストリーミング呼び出し ---
export async function callClaude(options: {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const { system, messages, maxTokens = 600, model = MODEL } = options;
  const client = getClient();

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages,
  });

  const block = response.content[0];
  if (block.type === 'text') {
    return block.text;
  }
  throw new Error('Unexpected response content type');
}

// --- callClaudeStream: ストリーミング呼び出し ---
export async function* callClaudeStream(options: {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
}): AsyncGenerator<string, void, unknown> {
  const { system, messages, maxTokens = 600, model = MODEL } = options;
  const client = getClient();

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

// --- 既存インターフェース維持: getReading ---
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

// --- 既存インターフェース維持: getSpreadReading ---
export interface SpreadCard {
  name: string;
  nameEn: string;
  isReversed: boolean;
  keywords: string[];
  position: string;
}

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
