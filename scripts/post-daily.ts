/**
 * 毎日の運勢 一括生成＆投稿スクリプト
 *
 * 1. Claude APIで12星座分の運勢を生成
 * 2. output/ にファイル保存
 * 3. X と Threads に自動投稿
 *
 * Usage:
 *   npx tsx scripts/post-daily.ts                    # 翌日分を生成＆投稿
 *   npx tsx scripts/post-daily.ts --date 2026-04-01  # 指定日の運勢
 *   npx tsx scripts/post-daily.ts --dry-run           # 投稿せずプレビュー
 *   npx tsx scripts/post-daily.ts --x-only            # Xのみ
 *   npx tsx scripts/post-daily.ts --threads-only      # Threadsのみ
 *   npx tsx scripts/post-daily.ts --generate-only     # 生成のみ（投稿しない）
 */

import { execSync } from 'child_process';
import * as path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname);

function run(cmd: string, label: string): boolean {
  console.error(`\n${'═'.repeat(50)}`);
  console.error(`▶ ${label}`);
  console.error('═'.repeat(50));
  try {
    execSync(cmd, { stdio: 'inherit', cwd: path.resolve(SCRIPTS_DIR, '..') });
    return true;
  } catch {
    console.error(`❌ ${label} に失敗しました`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const xOnly = args.includes('--x-only');
  const threadsOnly = args.includes('--threads-only');
  const generateOnly = args.includes('--generate-only');
  const dateIdx = args.indexOf('--date');
  const dateArg = dateIdx !== -1 ? args[dateIdx + 1] : undefined;

  // 日付を決定
  let targetDate: Date;
  if (dateArg) {
    targetDate = new Date(dateArg + 'T00:00:00+09:00');
  } else {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  const outDir = `output/horoscope`;
  const dataFile = `${outDir}/${dateStr}-data.json`;

  console.error('🌟 こんにゃん堂 毎日の運勢 自動投稿');
  console.error(`   日付: ${dateStr}`);
  console.error(`   モード: ${dryRun ? 'DRY RUN' : generateOnly ? '生成のみ' : xOnly ? 'Xのみ' : threadsOnly ? 'Threadsのみ' : 'X + Threads'}`);

  // Step 1: 運勢テキスト生成
  const genCmd = `npx tsx scripts/generate-daily-horoscope.ts --date ${dateStr} --out ${outDir}`;
  if (!run(genCmd, '運勢テキスト生成')) {
    process.exit(1);
  }

  if (generateOnly) {
    console.error('\n✅ 生成完了！投稿はスキップしました。');
    console.error(`   データ: ${dataFile}`);
    return;
  }

  const dryFlag = dryRun ? ' --dry-run' : '';

  // Step 2: X に投稿
  if (!threadsOnly) {
    const xCmd = `npx tsx scripts/post-to-x.ts ${dataFile}${dryFlag}`;
    run(xCmd, 'X (Twitter) 投稿');
  }

  // Step 3: Threads に投稿
  if (!xOnly) {
    const threadsCmd = `npx tsx scripts/post-to-threads.ts ${dataFile}${dryFlag}`;
    run(threadsCmd, 'Threads 投稿');
  }

  // Step 4: 週間企画コンテンツ投稿
  const platformFlag = xOnly ? ' --x-only' : threadsOnly ? ' --threads-only' : '';
  const weeklyCmd = `npx tsx scripts/post-weekly-content.ts --date ${dateStr}${dryFlag}${platformFlag}`;
  run(weeklyCmd, '週間企画コンテンツ');

  console.error('\n🎉 全工程完了！');
}

main();
