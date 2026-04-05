import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPayjp } from '@/lib/payjp';
import { getRedis } from '@/lib/redis';
import { addChatTickets, addSpreadTickets, TICKET_CHAT_TURNS } from '@/lib/usage';

const TICKET_PRICES = {
  chat: 300,
  spread: 150,
} as const;

const CheckoutSchema = z.object({
  type: z.enum(['chat', 'spread']),
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const uid = req.cookies.get('knd_uid')?.value;
  if (!uid) {
    return NextResponse.json({ error: 'セッションが無効です。' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 });
    }

    const { type, token } = parsed.data;
    const amount = TICKET_PRICES[type];

    const charge = await getPayjp().charges.create({
      amount,
      currency: 'jpy',
      card: token,
      metadata: { uid, ticket_type: type },
    });

    // 冪等性チェック（二重付与防止）
    const processedKey = `webhook:processed:${charge.id}`;
    const alreadyProcessed = await getRedis().get(processedKey);
    if (alreadyProcessed) {
      return NextResponse.json({ success: true });
    }

    // チケット付与
    if (type === 'chat') {
      await addChatTickets(uid, TICKET_CHAT_TURNS);
    } else {
      await addSpreadTickets(uid, 1);
    }

    // 処理済みマーク（7日間保持）
    await getRedis().set(processedKey, '1', { ex: 60 * 60 * 24 * 7 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    const message =
      error instanceof Error && 'response' in error
        ? '決済に失敗しました。カード情報をご確認ください。'
        : '決済の処理に失敗しました。';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
