import { NextRequest, NextResponse } from 'next/server';
import { getSpreadReading } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { cards, question } = await req.json();

    const spreadCards = cards.map(
      (c: { card: { name: string; nameEn: string; keywords: { upright: string[]; reversed: string[] } }; isReversed: boolean; position: string }) => ({
        name: c.card.name,
        nameEn: c.card.nameEn,
        isReversed: c.isReversed,
        keywords: c.isReversed ? c.card.keywords.reversed : c.card.keywords.upright,
        position: c.position,
      })
    );

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
