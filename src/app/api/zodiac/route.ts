import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
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

type ZodiacResult = {
  reading: string;
  overall: number;
  categories: { label: string; stars: number }[];
};

function getTodayJST(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
}

async function fetchZodiacReading(sign: string, signEn: string, dateStr: string): Promise<ZodiacResult> {
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

  const data = JSON.parse(text);
  return {
    reading: data.reading,
    overall: data.overall,
    categories: [
      { label: '恋愛運', stars: data.love },
      { label: '仕事運', stars: data.work },
      { label: '金運', stars: data.money },
    ],
  };
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
    const parsed = ZodiacRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sign, signEn } = parsed.data;
    const todayKey = getTodayJST();

    const getCached = unstable_cache(
      () => fetchZodiacReading(sign, signEn, todayKey),
      [`zodiac-${signEn}-${todayKey}`],
      { revalidate: 86400, tags: [`zodiac-${todayKey}`] },
    );

    const result = await getCached();
    return NextResponse.json(result);
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
