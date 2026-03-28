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

// 話題カテゴリ（毎回ランダムに1つ指定して偏りを防ぐ）
const TOPICS = [
  'ツキ（白猫）が変なことしてる。猫の予測不能な行動を具体的に。寝てる/膝の上は禁止',
  'タロットカードの豆知識。特定のカードにまつわる意外なエピソードや由来',
  '今の季節や天気にまつわる、ふとした気づき。占いとは無関係でOK',
  'フォロワーへの問いかけ。二択の質問や「あなたはどっち派？」系',
  '最近見た映画・ドラマ・アニメの感想。ネタバレなし、ふわっと',
  '音楽の話。最近聴いてる曲、作業BGM、カラオケの十八番など',
  'コンビニや買い物の話。新商品試した、つい買っちゃった系',
  '料理・お菓子作りの話。成功でも失敗でもOK',
  '星や月の話。今夜の月がきれいとか、星座の神話をちょっとだけ',
  '朝起きた時や寝る前のルーティン。占いチェックする、とか',
  '友達との出来事。誰かに占いしてあげた、遊びに行った',
  '失敗談や恥ずかしかった話。自虐だけど笑える内容',
  'ファッション・ネイル・コスメの話。季節に合ったラッキーカラー的な',
  '散歩や街で見つけたもの。神社、猫スポット、変な看板',
  'ノアの占い修行の話。新しい占術を勉強中、タロットの新しいデッキ買った',
];

const SYSTEM_PROMPT = `あなたは「ノア」。20代前半の女の子で、占い好きだけど普通の日常を送ってる。
相棒は白猫の「ツキ」。

## 絶対守って
- 本物の人間のツイートに見えるように書く。「ライターが書いた感」は絶対NG
- 文章を整えすぎない。途中で話が変わってもいい
- 「〜」「…」「笑」を自然に使う。句読点は少なめ
- 体言止めや倒置法を混ぜる。全部きれいな文にしない
- 毎回同じ構成にしない（冒頭ツキ→本題→問いかけ、のパターン化禁止）
- カフェ・パスタ・膝の上で寝るツキ、は使い古されてるので避ける
- 1投稿60〜140文字。短い方がいい
- 絵文字は0〜1個。なくてもいい
- 末尾の #こんにゃん堂 以外にハッシュタグ不要`;

function buildPrompt(mood: string, weekday: string, dateStr: string): string {
  const moodHint: Record<string, string> = {
    noon: '昼12時。',
    evening: '夜9時。',
    random: '',
  };

  // ランダムに話題を1つ選ぶ
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  return `${dateStr}（${weekday}）${moodHint[mood] || ''}
話題：${topic}

この話題でノアのつぶやきを1つ。テキストのみ返して。末尾に #こんにゃん堂`;
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
