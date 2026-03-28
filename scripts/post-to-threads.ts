/**
 * Threads 自動投稿スクリプト
 *
 * 前提: Meta Developer で Threads API アプリを作成し、
 *       長期トークンを取得して .env.local に設定済み
 *
 * Usage:
 *   npx tsx scripts/post-to-threads.ts output/horoscope/2026-03-29-data.json
 *   npx tsx scripts/post-to-threads.ts output/horoscope/2026-03-29-data.json --dry-run
 *   npx tsx scripts/post-to-threads.ts output/horoscope/2026-03-29-data.json --delay 60
 *
 * 環境変数:
 *   THREADS_ACCESS_TOKEN  — 長期アクセストークン（60日有効）
 *   THREADS_USER_ID       — Threads ユーザーID
 */

import './lib/env';
import * as fs from 'fs';
import type { DailyHoroscopeData } from './lib/types';
import { buildIndividualPost, buildRankingPost } from './lib/format';

const THREADS_API_BASE = 'https://graph.threads.net/v1.0';
const DEFAULT_DELAY_SEC = 30;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCredentials() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    console.error('❌ Threads API の認証情報が不足しています。.env.local に以下を設定してください:');
    console.error('   THREADS_ACCESS_TOKEN=...');
    console.error('   THREADS_USER_ID=...');
    process.exit(1);
  }

  return { accessToken, userId };
}

async function createThreadsPost(
  userId: string,
  accessToken: string,
  text: string,
  replyTo?: string,
): Promise<string> {
  // Step 1: メディアコンテナを作成
  const createParams = new URLSearchParams({
    media_type: 'TEXT',
    text,
    access_token: accessToken,
  });
  if (replyTo) {
    createParams.set('reply_to_id', replyTo);
  }

  const createRes = await fetch(`${THREADS_API_BASE}/${userId}/threads`, {
    method: 'POST',
    body: createParams,
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`コンテナ作成失敗 (${createRes.status}): ${err}`);
  }
  const { id: containerId } = (await createRes.json()) as { id: string };

  // Step 2: コンテナ処理待ち（Threads APIはコンテナ作成後に処理時間が必要）
  await sleep(5000);

  // Step 3: 公開
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const publishRes = await fetch(`${THREADS_API_BASE}/${userId}/threads_publish`, {
    method: 'POST',
    body: publishParams,
  });
  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`公開失敗 (${publishRes.status}): ${err}`);
  }
  const { id: postId } = (await publishRes.json()) as { id: string };
  return postId;
}

async function main() {
  const args = process.argv.slice(2);
  const dataFile = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const delayIdx = args.indexOf('--delay');
  const delaySec = delayIdx !== -1 ? Number(args[delayIdx + 1]) : DEFAULT_DELAY_SEC;

  if (!dataFile) {
    console.error('Usage: npx tsx scripts/post-to-threads.ts <data.json> [--dry-run] [--delay 30]');
    process.exit(1);
  }

  const raw = fs.readFileSync(dataFile, 'utf-8');
  const data: DailyHoroscopeData = JSON.parse(raw);
  const dateShort = data.date.replace(/\d+年/, '').replace('月', '/').replace('日', '');

  console.error(`📱 Threads投稿: ${data.date}（${data.weekday}）の運勢`);
  console.error(`   投稿数: 13（ランキング1 + 個別12）`);
  console.error(`   間隔: ${delaySec}秒`);
  if (dryRun) console.error('   ⚠️  DRY RUN モード（実際には投稿しません）');
  console.error('');

  const ranking = buildRankingPost(data.posts, dateShort);
  const individuals = data.posts.map((p) => buildIndividualPost(p, dateShort));

  const closing = `こんにゃん出ましたけど〜！🔮

今日もみんなにとっていい日になりますように✨
気になる星座があったらリプで教えてね！

#こんにゃん堂 #ノア`;

  const allPosts = [
    { label: '📊 ランキング', text: ranking },
    ...individuals.map((text, i) => ({
      label: `${data.posts[i].icon} ${data.posts[i].sign}`,
      text,
    })),
    { label: '🐱 締め', text: closing },
  ];

  if (dryRun) {
    for (const post of allPosts) {
      console.log(`── ${post.label} (${post.text.length}文字) ──`);
      console.log(post.text);
      console.log('');
    }
    console.error(`✅ DRY RUN完了: ${allPosts.length}投稿をプレビューしました`);
    return;
  }

  const { accessToken, userId } = getCredentials();
  let rankingPostId: string | undefined;

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    try {
      // 個別投稿はランキングへのリプライとしてスレッド化
      const replyTo = i > 0 ? rankingPostId : undefined;
      const postId = await createThreadsPost(userId, accessToken, post.text, replyTo);

      if (i === 0) rankingPostId = postId;

      console.error(`✅ [${i + 1}/${allPosts.length}] ${post.label} → ${postId}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`❌ [${i + 1}/${allPosts.length}] ${post.label} → エラー: ${message}`);

      if (message.includes('rate') || message.includes('429')) {
        console.error('⚠️  レート制限に達しました。残りの投稿を中断します。');
        break;
      }
    }

    if (i < allPosts.length - 1) {
      console.error(`   ⏳ ${delaySec}秒待機...`);
      await sleep(delaySec * 1000);
    }
  }

  console.error('');
  console.error('🎉 Threads投稿完了！');
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
