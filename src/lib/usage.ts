import { getRedis } from './redis';

export const FREE_CHAT_LIMIT = 3;

function todayKeyJST(): string {
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, '0');
  const d = String(jst.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function secondsUntilMidnightJST(): number {
  const now = new Date();
  const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const midnight = new Date(jstNow);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((midnight.getTime() - jstNow.getTime()) / 1000));
}

// --- チャット日次カウント（APIコスト暴走防止） ---

export async function getDailyChatCount(uid: string): Promise<number> {
  const key = `chat:count:${uid}:${todayKeyJST()}`;
  const count = await getRedis().get<number>(key);
  return count ?? 0;
}

export async function incrementChatCount(uid: string): Promise<number> {
  const key = `chat:count:${uid}:${todayKeyJST()}`;
  const count = await getRedis().incr(key);
  if (count === 1) {
    await getRedis().expire(key, secondsUntilMidnightJST());
  }
  return count;
}
