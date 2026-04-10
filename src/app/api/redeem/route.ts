import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { redeemCode } from '@/lib/codes';

const RedeemSchema = z.object({
  code: z.string().min(1).max(50),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'コードが無効です。',
  already_used: 'このコードはすでに使用済みです。',
  code_exhausted: 'このコードは上限に達しています。',
};

export async function POST(req: NextRequest) {
  const uid = req.cookies.get('knd_uid')?.value;
  if (!uid) {
    return NextResponse.json({ error: 'セッションが無効です。' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = RedeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 });
    }

    const result = await redeemCode(parsed.data.code, uid);

    if (!result.success) {
      const message = ERROR_MESSAGES[result.error!] ?? 'コードを使用できませんでした。';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      chatTurns: result.chatTurns,
      spreadCount: result.spreadCount,
    });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json({ error: 'コードの処理に失敗しました。' }, { status: 500 });
  }
}
