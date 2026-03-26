import { NextRequest, NextResponse } from 'next/server';
import { getReading } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { card, question, isReversed } = await req.json();

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
