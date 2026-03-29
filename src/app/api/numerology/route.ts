import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude } from '@/lib/claude';
import { NOA_NUMEROLOGY_SYSTEM_PROMPT } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';

const NumerologyRequestSchema = z.object({
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: '日付はYYYY-MM-DD形式で入力してください' })
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: '有効な日付を入力してください' }
    )
    .refine(
      (val) => {
        const d = new Date(val);
        return d.getFullYear() >= 1900;
      },
      { message: '1900年以降の日付を入力してください' }
    )
    .refine(
      (val) => {
        const d = new Date(val);
        return d <= new Date();
      },
      { message: '未来の日付は指定できません' }
    ),
});

/**
 * ライフパスナンバーを計算する
 * マスターナンバー 11, 22, 33 はそのまま返す
 */
function calcLifePathNumber(birthdate: string): number {
  const digits = birthdate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((acc, d) => acc + d, 0);

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((acc, d) => acc + d, 0);
  }

  return sum;
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
    const parsed = NumerologyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { birthdate } = parsed.data;
    const lifePathNumber = calcLifePathNumber(birthdate);

    const text = await callClaude({
      system: NOA_NUMEROLOGY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `【生年月日】${birthdate}\n【ライフパスナンバー】${lifePathNumber}\nこのライフパスナンバーの意味を教えて！`,
        },
      ],
      maxTokens: 400,
      model: 'claude-haiku-4-5-20251001',
    });

    const parsed2 = JSON.parse(text);

    return NextResponse.json({
      lifePathNumber: parsed2.lifePathNumber ?? lifePathNumber,
      keyword: parsed2.keyword,
      reading: parsed2.reading,
    });
  } catch (error) {
    console.error('Numerology API error:', error);
    return NextResponse.json(
      {
        lifePathNumber: 1,
        keyword: '新しい始まり',
        reading:
          'ツキがあなたの数字を読み取ってくれたよ！あなたには強いリーダーシップと独自の個性があるみたい。自分を信じて新しいことに挑戦してみて。きっといい流れが来るよ✨',
      },
      { status: 200 }
    );
  }
}
