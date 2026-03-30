/**
 * X (Twitter) 自動投稿スクリプト
 *
 * 前提: X Developer Portal で Free tier アプリを作成し、
 *       OAuth 1.0a の4つのキーを .env.local に設定済み
 *
 * Usage:
 *   npx tsx scripts/post-to-x.ts output/horoscope/2026-03-29-data.json
 *   npx tsx scripts/post-to-x.ts output/horoscope/2026-03-29-data.json --dry-run
 *   npx tsx scripts/post-to-x.ts output/horoscope/2026-03-29-data.json --delay 120
 */

import './lib/env';
import * as fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import type { DailyHoroscopeData, ZodiacPost } from './lib/types';
import { buildIndividualPost, buildRankingPost } from './lib/format';

const OG_BASE_URL = 'https://konnyandou-buc7.vercel.app';

const DEFAULT_DELAY_SEC = 90; // 投稿間隔（秒）

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getClient(): TwitterApi {
  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    console.error('❌ X API の認証情報が不足しています。.env.local に以下を設定してください:');
    console.error('   TWITTER_API_KEY=...');
    console.error('   TWITTER_API_SECRET=...');
    console.error('   TWITTER_ACCESS_TOKEN=...');
    console.error('   TWITTER_ACCESS_SECRET=...');
    process.exit(1);
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

async function fetchZodiacImage(post: ZodiacPost): Promise<Buffer | null> {
  try {
    const params = new URLSearchParams({
      type: 'zodiac',
      sign: post.sign,
      icon: post.icon,
      stars: String(post.stars),
    });
    const url = `${OG_BASE_URL}/api/og?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

async function uploadMedia(client: TwitterApi, imageBuffer: Buffer): Promise<string | null> {
  try {
    const mediaId = await client.v2.uploadMedia(imageBuffer, { media_type: 'image/png' });
    return mediaId;
  } catch (e) {
    console.error(`   ⚠️  画像アップロード失敗: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

async function postTweet(
  client: TwitterApi,
  text: string,
  replyTo?: string,
  mediaId?: string,
): Promise<string> {
  const params: {
    text: string;
    reply?: { in_reply_to_tweet_id: string };
    media?: { media_ids: [string] };
  } = { text };
  if (replyTo) {
    params.reply = { in_reply_to_tweet_id: replyTo };
  }
  if (mediaId) {
    params.media = { media_ids: [mediaId] };
  }
  const result = await client.v2.tweet(params);
  return result.data.id;
}

async function main() {
  const args = process.argv.slice(2);
  const dataFile = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  const delayIdx = args.indexOf('--delay');
  const delaySec = delayIdx !== -1 ? Number(args[delayIdx + 1]) : DEFAULT_DELAY_SEC;

  if (!dataFile) {
    console.error('Usage: npx tsx scripts/post-to-x.ts <data.json> [--dry-run] [--delay 90]');
    process.exit(1);
  }

  const raw = fs.readFileSync(dataFile, 'utf-8');
  const data: DailyHoroscopeData = JSON.parse(raw);
  const dateShort = data.date.replace(/\d+年/, '').replace('月', '/').replace('日', '');

  console.error(`📱 X投稿: ${data.date}（${data.weekday}）の運勢`);
  console.error(`   投稿数: 13（ランキング1 + 個別12）`);
  console.error(`   間隔: ${delaySec}秒`);
  if (dryRun) console.error('   ⚠️  DRY RUN モード（実際には投稿しません）');
  console.error('');

  // 投稿テキスト一覧を作成
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

  const client = getClient();
  let rankingTweetId: string | undefined;

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    try {
      // 個別投稿はランキングへのリプライとしてスレッド化
      const replyTo = i > 0 ? rankingTweetId : undefined;

      // 個別星座投稿（インデックス1〜12）に画像を添付
      let mediaId: string | undefined;
      const zodiacIndex = i - 1; // ランキングが0番目なので
      if (zodiacIndex >= 0 && zodiacIndex < data.posts.length) {
        const imageBuffer = await fetchZodiacImage(data.posts[zodiacIndex]);
        if (imageBuffer) {
          const uploaded = await uploadMedia(client, imageBuffer);
          if (uploaded) {
            mediaId = uploaded;
            console.error(`   🖼 画像アップロード完了: ${mediaId}`);
          }
        }
      }

      const tweetId = await postTweet(client, post.text, replyTo, mediaId);

      if (i === 0) rankingTweetId = tweetId;

      console.error(`✅ [${i + 1}/${allPosts.length}] ${post.label} → ${tweetId}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`❌ [${i + 1}/${allPosts.length}] ${post.label} → エラー: ${message}`);

      // レート制限エラーの場合は中断
      if (message.includes('429') || message.includes('rate')) {
        console.error('⚠️  レート制限に達しました。残りの投稿を中断します。');
        console.error(`   未投稿: ${allPosts.length - i - 1}件`);
        break;
      }
    }

    // 最後の投稿でなければ待機
    if (i < allPosts.length - 1) {
      console.error(`   ⏳ ${delaySec}秒待機...`);
      await sleep(delaySec * 1000);
    }
  }

  console.error('');
  console.error('🎉 X投稿完了！');
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
