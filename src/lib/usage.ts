import { getRedis } from './redis';

export const FREE_CHAT_LIMIT = 3;
export const TICKET_CHAT_TURNS = 15;

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

// --- チャット日次カウント ---

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

// --- チャットチケット ---

export async function getChatTickets(uid: string): Promise<number> {
  const count = await getRedis().get<number>(`tickets:chat:${uid}`);
  return count ?? 0;
}

export async function consumeChatTicket(uid: string): Promise<boolean> {
  const key = `tickets:chat:${uid}`;
  const remaining = await getRedis().get<number>(key);
  if (!remaining || remaining <= 0) return false;
  await getRedis().decr(key);
  return true;
}

export async function addChatTickets(uid: string, count: number): Promise<void> {
  const key = `tickets:chat:${uid}`;
  await getRedis().incrby(key, count);
}

// --- スプレッドチケット ---

export async function getSpreadTickets(uid: string): Promise<number> {
  const count = await getRedis().get<number>(`tickets:spread:${uid}`);
  return count ?? 0;
}

export async function consumeSpreadTicket(uid: string): Promise<boolean> {
  const key = `tickets:spread:${uid}`;
  const remaining = await getRedis().get<number>(key);
  if (!remaining || remaining <= 0) return false;
  await getRedis().decr(key);
  return true;
}

export async function addSpreadTickets(uid: string, count: number): Promise<void> {
  const key = `tickets:spread:${uid}`;
  await getRedis().incrby(key, count);
}

// --- 使用量サマリー ---

export interface UsageSummary {
  chatCount: number;
  chatLimit: number;
  chatTickets: number;
  spreadTickets: number;
}

export async function getUsageSummary(uid: string): Promise<UsageSummary> {
  const [chatCount, chatTickets, spreadTickets] = await Promise.all([
    getDailyChatCount(uid),
    getChatTickets(uid),
    getSpreadTickets(uid),
  ]);
  return {
    chatCount,
    chatLimit: FREE_CHAT_LIMIT,
    chatTickets,
    spreadTickets,
  };
}
