import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getReading } from '@/lib/claude';
import { rateLimit } from '@/lib/rate-limit';

const TarotRequestSchema = z.object({
  card: z.object({
    name: z.string().min(1),
    nameEn: z.string().min(1),
    keywords: z.object({
      upright: z.array(z.string()),
      reversed: z.array(z.string()),
    }),
  }),
  question: z.string().max(200).optional(),
  isReversed: z.boolean(),
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
    const parsed = TarotRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { card, question, isReversed } = parsed.data;

    const reading = await getReading(
      {
        name: card.name,
        nameEn: card.nameEn,
        isReversed,
        keywords: isReversed ? card.keywords.reversed : card.keywords.upright,
      },
      question || '今日の運勢を教えて'
    );

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Tarot API error:', error);
    return NextResponse.json(
      { error: '占いに失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
