import { NextRequest, NextResponse } from 'next/server';
import { getUsageSummary } from '@/lib/usage';

export async function GET(req: NextRequest) {
  const uid = req.cookies.get('knd_uid')?.value;
  if (!uid) {
    return NextResponse.json({ error: 'セッションが無効です。' }, { status: 401 });
  }

  const summary = await getUsageSummary(uid);
  return NextResponse.json(summary);
}
