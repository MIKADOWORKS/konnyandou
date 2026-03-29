import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callClaude } from '@/lib/claude';
import { NOA_COMPATIBILITY_SYSTEM_PROMPT } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';

const VALID_SIGNS_EN = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

const CompatibilityRequestSchema = z.object({
  person1Name: z.string().max(20).optional(),
  person1Sign: z.string().refine(
    (val) => VALID_SIGNS_EN.includes(val.toLowerCase() as typeof VALID_SIGNS_EN[number]),
    { message: '無効な星座です（person1）' }
  ),
  person2Name: z.string().max(20).optional(),
  person2Sign: z.string().refine(
    (val) => VALID_SIGNS_EN.includes(val.toLowerCase() as typeof VALID_SIGNS_EN[number]),
    { message: '無効な星座です（person2）' }
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
    const parsed = CompatibilityRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '入力内容に不備があります。', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { person1Name, person1Sign, person2Name, person2Sign } = parsed.data;

    const p1 = person1Name ? `${person1Name}（${person1Sign}）` : person1Sign;
    const p2 = person2Name ? `${person2Name}（${person2Sign}）` : person2Sign;

    const text = await callClaude({
      system: NOA_COMPATIBILITY_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `【1人目】${p1}\n【2人目】${p2}\n2人の相性を占って！`,
        },
      ],
      maxTokens: 500,
      model: 'claude-haiku-4-5-20251001',
    });

    const parsed2 = JSON.parse(text);

    return NextResponse.json({
      reading: parsed2.reading,
      score: parsed2.score,
      categories: [
        { label: '恋愛相性', stars: parsed2.love },
        { label: '仕事相性', stars: parsed2.work },
        { label: '友情相性', stars: parsed2.friendship },
      ],
    });
  } catch (error) {
    console.error('Compatibility API error:', error);
    return NextResponse.json(
      {
        reading: '2人の星の流れを読んでみたよ！お互いの個性がうまく噛み合って、刺激し合えるいい関係になれそう。違いを楽しむ気持ちが大切だよ。',
        score: 72,
        categories: [
          { label: '恋愛相性', stars: 4 },
          { label: '仕事相性', stars: 3 },
          { label: '友情相性', stars: 4 },
        ],
      },
      { status: 200 }
    );
  }
}
