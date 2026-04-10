import { getRedis } from './redis';
import { addChatTickets, addSpreadTickets } from './usage';

export interface CodeData {
  type: 'chat' | 'spread';
  chatTurns: number;
  spreadCount: number;
  maxUses: number;
  usedCount: number;
  createdAt: number;
}

export type RedeemError = 'invalid_code' | 'already_used' | 'code_exhausted';

export interface RedeemResult {
  success: boolean;
  error?: RedeemError;
  chatTurns?: number;
  spreadCount?: number;
}

const CODE_TTL = 60 * 60 * 24 * 365; // 1年

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s/g, '');
}

export async function redeemCode(rawCode: string, uid: string): Promise<RedeemResult> {
  const code = normalizeCode(rawCode);
  const redis = getRedis();
  const codeKey = `code:${code}`;
  const usedKey = `code:used:${code}:${uid}`;

  // このユーザーがすでに使用済みか確認
  const alreadyUsed = await redis.get(usedKey);
  if (alreadyUsed) {
    return { success: false, error: 'already_used' };
  }

  // コードデータを取得
  const data = await redis.get<CodeData>(codeKey);
  if (!data) {
    return { success: false, error: 'invalid_code' };
  }

  if (data.usedCount >= data.maxUses) {
    return { success: false, error: 'code_exhausted' };
  }

  // 使用回数をインクリメント
  await redis.set(codeKey, { ...data, usedCount: data.usedCount + 1 }, { ex: CODE_TTL });

  // このユーザーの使用済みフラグをセット
  await redis.set(usedKey, 1, { ex: CODE_TTL });

  // チケット付与
  if (data.chatTurns > 0) {
    await addChatTickets(uid, data.chatTurns);
  }
  if (data.spreadCount > 0) {
    await addSpreadTickets(uid, data.spreadCount);
  }

  return {
    success: true,
    chatTurns: data.chatTurns,
    spreadCount: data.spreadCount,
  };
}
