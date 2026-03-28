import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude } from '@/lib/claude';
import { NOA_CHAT_SYSTEM_PROMPT } from '@/lib/prompts';
import { majorArcana } from '@/lib/tarot-data';
import { rateLimit } from '@/lib/rate-limit';

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
});

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

    const { message, history } = parsed.data;

    // Pick a random card for context
    const card = majorArcana[Math.floor(Math.random() * majorArcana.length)];
    const isReversed = Math.random() > 0.5;
    const position = isReversed ? '逆位置' : '正位置';
    const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;

    const conversationHistory = history.map((msg) => ({
      role: msg.from === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));

    conversationHistory.push({
      role: 'user',
      content: message,
    });

    const systemPrompt = `${NOA_CHAT_SYSTEM_PROMPT}\n\n【今回引いたカード】「${card.name}」（${card.nameEn}）${position}\n【キーワード】${keywords.join('、')}`;

    const reply = await callClaude({
      system: systemPrompt,
      messages: conversationHistory,
      maxTokens: 400,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { reply: 'ごめんね、ちょっと電波が不安定みたい…🐱 もう一回聞いてみて！' },
      { status: 200 }
    );
  }
}
