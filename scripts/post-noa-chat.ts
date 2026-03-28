/**
 * ノアの雑談投稿スクリプト
 *
 * ノアのキャラクターで日常的なつぶやきを生成・投稿
 * 朝の運勢とは別の時間帯（昼/夜）に投稿する用
 *
 * Usage:
 *   npx tsx scripts/post-noa-chat.ts                  # 生成＆投稿
 *   npx tsx scripts/post-noa-chat.ts --dry-run        # プレビューのみ
 *   npx tsx scripts/post-noa-chat.ts --x-only
 *   npx tsx scripts/post-noa-chat.ts --threads-only
 *   npx tsx scripts/post-noa-chat.ts --mood evening   # 夜モード
 */

import './lib/env';
import Anthropic from '@anthropic-ai/sdk';
import { TwitterApi } from 'twitter-api-v2';

const MODEL = 'claude-haiku-4-5-20251001';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const SYSTEM_PROMPT = `あなたは「ノア」です。こんにゃん堂のAI占いフレンド。
SNSで日常的なつぶやきをします。

## キャラクター
- 20代前半の女の子。占い好きの友達
- タメ口で親しみやすい。でも馴れ馴れしすぎない
- 相棒は白猫の「ツキ」。よく登場させる
- 占いが好きだけど、普通の女の子としての日常もある

## つぶやきのバリエーション
- ツキの日常（猫あるある、かわいい仕草）
- 占いにまつわる小話（タロットカードの豆知識、星の話）
- 季節・天気・曜日に関する共感ネタ
- フォロワーへの問いかけ（「みんなは〜？」系）
- ノアの日常（カフェ行った、本読んだ、映画見た等）
- ちょっとしたポジティブメッセージ

## ルール
- 1投稿100〜180文字（短くてOK）
- 絵文字は1〜2個
- ハッシュタグは #こんにゃん堂 のみ
- 宣伝っぽくしない。あくまで日常のつぶやき
- 占い要素は入れても入れなくてもOK
- フォロワーが思わずリプしたくなる投稿が理想`;

function buildPrompt(mood: string, weekday: string, dateStr: string): string {
  const moodContext = {
    noon: `昼の12時頃の投稿です。ランチタイムの雰囲気で。`,
    evening: `夜の21時頃の投稿です。一日の終わりのリラックスした雰囲気で。`,
    random: `時間帯は自由。`,
  }[mood] || moodContext.noon;

  return `今日は${dateStr}（${weekday}曜日）です。${moodContext}

ノアとして自然なつぶやきを1つ作ってください。
投稿テキストのみを返してください（JSON不要）。末尾に #こんにゃん堂 を付けてください。`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postToX(text: string): Promise<string> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  const result = await client.v2.tweet({ text });
  return result.data.id;
}

async function postToThreads(text: string): Promise<string> {
  const token = process.env.THREADS_ACCESS_TOKEN!;
  const userId = process.env.THREADS_USER_ID!;

  const createParams = new URLSearchParams({ media_type: 'TEXT', text, access_token: token });
  const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, { method: 'POST', body: createParams });
  const { id: containerId } = (await createRes.json()) as { id: string };

  const publishParams = new URLSearchParams({ creation_id: containerId, access_token: token });
  const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, { method: 'POST', body: publishParams });
  const { id: postId } = (await publishRes.json()) as { id: string };
  return postId;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const xOnly = args.includes('--x-only');
  const threadsOnly = args.includes('--threads-only');
  const moodIdx = args.indexOf('--mood');
  const mood = moodIdx !== -1 ? args[moodIdx + 1] : 'noon';

  const now = new Date();
  const weekday = WEEKDAYS[now.getDay()];
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const dateStr = `${m}月${d}日`;

  console.error(`💬 ノアの雑談生成中...（${mood}モード）`);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(mood, weekday, dateStr) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') { console.error('❌ エラー'); process.exit(1); }

  const text = block.text.trim();

  console.error(`✅ 生成完了（${text.length}文字）`);
  console.error(`   tokens: in=${response.usage.input_tokens} out=${response.usage.output_tokens}`);

  if (dryRun) {
    console.log(text);
    console.error('⚠️ DRY RUN');
    return;
  }

  // X投稿
  if (!threadsOnly) {
    try {
      const id = await postToX(text);
      console.error(`✅ X: ${id}`);
    } catch (e: unknown) {
      console.error(`❌ X:`, e instanceof Error ? e.message : e);
    }
  }

  // Threads投稿
  if (!xOnly) {
    try {
      await sleep(3000);
      const id = await postToThreads(text);
      console.error(`✅ Threads: ${id}`);
    } catch (e: unknown) {
      console.error(`❌ Threads:`, e instanceof Error ? e.message : e);
    }
  }

  console.error('🎉 雑談投稿完了！');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
