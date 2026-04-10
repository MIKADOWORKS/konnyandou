/**
 * noteチケットコード生成スクリプト
 *
 * Usage:
 *   npx tsx scripts/generate-code.ts --type chat --uses 50
 *   npx tsx scripts/generate-code.ts --type spread --uses 30
 *
 * Options:
 *   --type   chat | spread  （必須）
 *   --uses   最大使用回数 （デフォルト: 50）
 *
 * 環境変数:
 *   KV_REST_API_URL, KV_REST_API_TOKEN （.env.local から読み込まれる）
 */

import { Redis } from '@upstash/redis';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// .env.local を手動でロード（tsx 実行時に dotenv が不要なように）
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

// KND-XXXX-XXXX 形式のコードを生成（紛らわしい文字を除外）
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join('');
  return `KND-${segment()}-${segment()}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1]) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

async function main() {
  loadEnv();

  const args = parseArgs();
  const type = args['type'] as 'chat' | 'spread';
  const maxUses = parseInt(args['uses'] ?? '50', 10);

  if (!type || !['chat', 'spread'].includes(type)) {
    console.error('エラー: --type chat または --type spread を指定してください');
    process.exit(1);
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error('エラー: KV_REST_API_URL / KV_REST_API_TOKEN が設定されていません');
    process.exit(1);
  }

  const redis = new Redis({ url, token });

  const code = generateCode();
  const codeData = {
    type,
    chatTurns: type === 'chat' ? 15 : 0,
    spreadCount: type === 'spread' ? 1 : 0,
    maxUses,
    usedCount: 0,
    createdAt: Date.now(),
  };

  const TTL = 60 * 60 * 24 * 365; // 1年
  await redis.set(`code:${code}`, codeData, { ex: TTL });

  console.log('\n========================================');
  console.log('  コード生成完了');
  console.log('========================================');
  console.log(`  コード    : ${code}`);
  console.log(`  種別      : ${type === 'chat' ? 'チャット（15回分）' : 'スプレッド（1回分）'}`);
  console.log(`  最大使用数: ${maxUses}回`);
  console.log('========================================\n');
  console.log('このコードをnote記事の有料エリアに貼り付けてください。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
