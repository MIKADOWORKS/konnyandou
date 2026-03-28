import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSpreadReading } from '@/lib/claude';
import { rateLimit } from '@/lib/rate-limit';

const SpreadCardSchema = z.object({
  card: z.object({
    name: z.string().min(1),
    nameEn: z.string().min(1),
    keywords: z.object({
      upright: z.array(z.string()),
      reversed: z.array(z.string()),
    }),
  }),
  isReversed: z.boolean(),
  position: z.string().min(1),
});

const SpreadRequestSchema = z.object({
  cards: z.array(SpreadCardSchema).length(3),
  question: z.string().max(200).optional(),
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
    const parsed = SpreadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { cards, question } = parsed.data;

    const spreadCards = cards.map((c) => ({
      name: c.card.name,
      nameEn: c.card.nameEn,
      isReversed: c.isReversed,
      keywords: c.isReversed ? c.card.keywords.reversed : c.card.keywords.upright,
      position: c.position,
    }));

    const reading = await getSpreadReading(spreadCards, question || '今日の運勢を教えて');

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Tarot spread API error:', error);
    return NextResponse.json(
      { error: '占いに失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
