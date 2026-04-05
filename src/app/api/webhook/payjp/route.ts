import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { addChatTickets, addSpreadTickets, TICKET_CHAT_TURNS } from '@/lib/usage';

export async function POST(req: NextRequest) {
  // PAY.JP Webhook トークン検証
  const webhookToken = req.headers.get('x-payjp-webhook-token');
  if (webhookToken !== process.env.PAYJP_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Invalid webhook token' }, { status: 401 });
  }

  try {
    const event = await req.json();

    if (event.type !== 'charge.succeeded') {
      return NextResponse.json({ received: true });
    }

    const charge = event.data;
    const chargeId = charge.id as string;

    // 冪等性チェック（/api/checkoutで付与済みならスキップ）
    const processedKey = `webhook:processed:${chargeId}`;
    const alreadyProcessed = await getRedis().get(processedKey);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true });
    }

    const uid = charge.metadata?.uid as string | undefined;
    const ticketType = charge.metadata?.ticket_type as string | undefined;

    if (!uid || !ticketType) {
      console.error('Webhook missing metadata:', { uid, ticketType, chargeId });
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // チケット付与（バックアップ）
    if (ticketType === 'chat') {
      await addChatTickets(uid, TICKET_CHAT_TURNS);
    } else if (ticketType === 'spread') {
      await addSpreadTickets(uid, 1);
    }

    await getRedis().set(processedKey, '1', { ex: 60 * 60 * 24 * 7 });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
