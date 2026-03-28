/**
 * メモリベースのIPレート制限
 * Map + タイムスタンプ方式（外部依存不要）
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/** 古いエントリを定期的にクリーンアップ（メモリリーク防止） */
const CLEANUP_INTERVAL = 60 * 1000; // 1分
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * IPベースのレート制限を実行する
 * @param ip クライアントのIPアドレス
 * @param maxRequests ウィンドウ内の最大リクエスト数
 * @param windowMs 時間ウィンドウ（ミリ秒）
 */
export function rateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // ウィンドウ外のタイムスタンプを除去
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      success: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}
