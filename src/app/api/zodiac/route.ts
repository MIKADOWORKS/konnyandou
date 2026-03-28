import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude } from '@/lib/claude';
import { NOA_ZODIAC_SYSTEM_PROMPT } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';

const VALID_SIGNS_EN = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

const ZodiacRequestSchema = z.object({
  sign: z.string().min(1),
  signEn: z.string().refine(
    (val) => VALID_SIGNS_EN.includes(val.toLowerCase() as typeof VALID_SIGNS_EN[number]),
    { message: '無効な星座です' }
  ),
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
    const parsed = ZodiacRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sign, signEn } = parsed.data;

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    const text = await callClaude({
      system: NOA_ZODIAC_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `【星座】${sign}（${signEn}）\n【日付】${dateStr}\n今日の運勢を教えて！`,
        },
      ],
      maxTokens: 400,
    });

    const parsed2 = JSON.parse(text);

    return NextResponse.json({
      reading: parsed2.reading,
      overall: parsed2.overall,
      categories: [
        { label: '恋愛運', stars: parsed2.love },
        { label: '仕事運', stars: parsed2.work },
        { label: '金運', stars: parsed2.money },
      ],
    });
  } catch (error) {
    console.error('Zodiac API error:', error);
    return NextResponse.json(
      {
        reading: '今日は直感がさえてる日！ふと思いついたことをメモしておくと、あとで役立つかも。午後からは人との会話にヒントが隠れてるよ。',
        overall: 4,
        categories: [
          { label: '恋愛運', stars: 4 },
          { label: '仕事運', stars: 3 },
          { label: '金運', stars: 5 },
        ],
      },
      { status: 200 }
    );
  }
}
