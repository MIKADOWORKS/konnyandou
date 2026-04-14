import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude, callClaudeStream } from '@/lib/claude';
import { NOA_CHAT_SYSTEM_PROMPT } from '@/lib/prompts';
import { majorArcana } from '@/lib/tarot-data';
import { rateLimit } from '@/lib/rate-limit';
import {
  getDailyChatCount,
  incrementChatCount,
  FREE_CHAT_LIMIT,
} from '@/lib/usage';

const MAX_HISTORY_LENGTH = 20;

const ChatMessageSchema = z.object({
  from: z.enum(['user', 'noa']),
  text: z.string().min(1).max(2000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'メッセージを入力してください').max(500, 'メッセージが長すぎます'),
  history: z
    .array(ChatMessageSchema)
    .max(MAX_HISTORY_LENGTH, `履歴は最大${MAX_HISTORY_LENGTH}件までです`)
    .optional()
    .default([]),
  stream: z.boolean().optional().default(false),
});

function buildSystemPrompt(): string {
  const card = majorArcana[Math.floor(Math.random() * majorArcana.length)];
  const isReversed = Math.random() > 0.5;
  const position = isReversed ? '逆位置' : '正位置';
  const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;
  return `${NOA_CHAT_SYSTEM_PROMPT}\n\n【今回引いたカード】「${card.name}」（${card.nameEn}）${position}\n【キーワード】${keywords.join('、')}`;
}

function buildMessages(
  history: { from: string; text: string }[],
  message: string
): { role: 'user' | 'assistant'; content: string }[] {
  const conversationHistory = history.map((msg) => ({
    role: (msg.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: msg.text,
  }));
  conversationHistory.push({ role: 'user', content: message });
  return conversationHistory;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const limit = rateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'リクエストが多すぎます。しばらくしてからお試しください。' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 使用量チェック
    const uid = req.cookies.get('knd_uid')?.value;
    if (!uid) {
      return NextResponse.json({ error: 'セッションが無効です。ページを再読み込みしてください。' }, { status: 401 });
    }

    const dailyCount = await getDailyChatCount(uid);

    if (dailyCount >= FREE_CHAT_LIMIT) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: '今日のおしゃべりはここまで！明日また話しかけてにゃ🐱',
        },
        { status: 429 }
      );
    }

    const { message, history, stream } = parsed.data;
    const systemPrompt = buildSystemPrompt();
    const messages = buildMessages(history, message);

    const CHAT_MODEL = 'claude-sonnet-4-6';

    // 使用量を消費（API呼び出し前にカウント）
    await incrementChatCount(uid);
    const remaining = FREE_CHAT_LIMIT - (dailyCount + 1);

    const usageHeaders = {
      'X-Chat-Remaining': String(remaining),
    };

    // ストリーミングモード
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const gen = callClaudeStream({
              system: systemPrompt,
              messages,
              maxTokens: 400,
              model: CHAT_MODEL,
            });
            for await (const chunk of gen) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: 'ごめんね、ちょっと電波が不安定みたい…🐱 もう一回聞いてみて！' })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...usageHeaders,
        },
      });
    }

    // 非ストリーミングモード（後方互換）
    const reply = await callClaude({
      system: systemPrompt,
      messages,
      maxTokens: 400,
      model: CHAT_MODEL,
    });

    return NextResponse.json({ reply }, { headers: usageHeaders });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        reply: 'ごめんね、ちょっと電波が不安定みたい…🐱 もう一回聞いてみて！',
      },
      { status: 200 }
    );
  }
}
