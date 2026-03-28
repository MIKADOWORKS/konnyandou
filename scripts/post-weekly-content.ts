/**
 * 週間企画コンテンツを X / Threads に投稿
 *
 * Usage:
 *   npx tsx scripts/post-weekly-content.ts
 *   npx tsx scripts/post-weekly-content.ts --date 2026-04-01
 *   npx tsx scripts/post-weekly-content.ts --dry-run
 *   npx tsx scripts/post-weekly-content.ts --x-only
 *   npx tsx scripts/post-weekly-content.ts --threads-only
 */

import './lib/env';
import Anthropic from '@anthropic-ai/sdk';
import { TwitterApi } from 'twitter-api-v2';

const MODEL = 'claude-haiku-4-5-20251001';
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const WEEKLY_THEMES: Record<number, { theme: string; prompt: string }> = {
  0: {
    theme: '相性ランキング',
    prompt: `今週の星座相性ランキングを作ってください。
形式: 最高の相性カップル3組（星座×星座 + 一言理由）と、注意な組み合わせ1組（ポジティブなアドバイス付き）
JSON形式: {"bestPairs":[{"pair":"牡羊座×獅子座","reason":"一言"}],"cautionPair":{"pair":"..","advice":".."}}`
  },
  1: {
    theme: '星座あるある',
    prompt: `ランダムに1つの星座を選んで「あるある」ネタを3つ作ってください。共感を呼ぶ内容で。各あるあるは40文字以内。
JSON形式: {"sign":"星座","icon":"♈","items":["あるある1","あるある2","あるある3"]}`
  },
  2: {
    theme: '星座別ランキング',
    prompt: `面白いテーマで星座ランキングTOP5を作ってください。テーマは自分で選んで。各コメントは20文字以内。
JSON形式: {"rankingTitle":"○○な星座TOP5","rankings":[{"rank":1,"sign":"星座","icon":"♈","comment":"一言"}]}`
  },
  3: {
    theme: 'ノアのお悩み相談',
    prompt: `よくある悩みを1つ取り上げて、ノアがタロット1枚引いてアドバイスする投稿を。アドバイスは2文以内。
JSON形式: {"worry":"お悩み","card":"カード名","cardEmoji":"🔮","advice":"アドバイス"}`
  },
  4: {
    theme: '今週のラッキー○○',
    prompt: `12星座のラッキーフード/アイテム/スポットのうち1つ選んで12星座分作って。各アイテムは8文字以内。
JSON形式: {"category":"ラッキーフード","categoryEmoji":"🍕","items":[{"sign":"牡羊座","icon":"♈","item":"名前"}]}`
  },
  5: {
    theme: '週末おすすめ',
    prompt: `3つの星座をピックアップして週末の過ごし方を提案。各提案は30文字以内。
JSON形式: {"picks":[{"sign":"星座","icon":"♈","suggestion":"過ごし方"}]}`
  },
  6: {
    theme: '星座クイズ',
    prompt: `星座に関する楽しいクイズを1問。選択肢3つ。問題は40文字以内。
JSON形式: {"question":"問題","options":["A","B","C"],"answer":"正解","explanation":"解説"}`
  },
};

function formatPost(dayOfWeek: number, data: Record<string, unknown>): { main: string; reply?: string } {
  switch (dayOfWeek) {
    case 0: {
      const d = data as { bestPairs: { pair: string; reason: string }[]; cautionPair: { pair: string; advice: string } };
      const pairs = d.bestPairs.map((p, i) => `${['🥇', '🥈', '🥉'][i]}${p.pair}\n  ${p.reason}`).join('\n');
      return { main: `💕今週の相性ランキング\n\n${pairs}\n\n⚠️${d.cautionPair.pair}\n→${d.cautionPair.advice}\n\n#星座占い #こんにゃん堂` };
    }
    case 1: {
      const d = data as { sign: string; icon: string; items: string[] };
      const items = d.items.map((item, i) => `${i + 1}. ${item}`).join('\n');
      return { main: `${d.icon}${d.sign}あるある\n\n${items}\n\n当てはまったら❤️で教えて！\n#星座あるある #${d.sign} #こんにゃん堂` };
    }
    case 2: {
      const d = data as { rankingTitle: string; rankings: { rank: number; sign: string; icon: string; comment: string }[] };
      const lines = d.rankings.map(r => `${r.rank}位${r.icon}${r.sign}：${r.comment}`).join('\n');
      return { main: `🏆${d.rankingTitle}\n\n${lines}\n\nあなたは何位だった？\n#星座ランキング #こんにゃん堂` };
    }
    case 3: {
      const d = data as { worry: string; card: string; cardEmoji: string; advice: string };
      return { main: `📮お悩み：${d.worry}\n\n🔮${d.cardEmoji}${d.card}\n\n${d.advice}\n\n相談あったらリプしてね！\n#タロット #こんにゃん堂` };
    }
    case 4: {
      const d = data as { category: string; categoryEmoji: string; items: { sign: string; icon: string; item: string }[] };
      const lines = d.items.map(i => `${i.icon}${i.sign}→${i.item}`).join('\n');
      return { main: `${d.categoryEmoji}今週の${d.category}\n\n${lines}\n\n#星座占い #こんにゃん堂` };
    }
    case 5: {
      const d = data as { picks: { sign: string; icon: string; suggestion: string }[] };
      const lines = d.picks.map(p => `${p.icon}${p.sign}\n→${p.suggestion}`).join('\n\n');
      return { main: `🎉週末のおすすめ\n\n${lines}\n\n素敵な週末を！\n#星座占い #こんにゃん堂` };
    }
    case 6: {
      const d = data as { question: string; options: string[]; answer: string; explanation: string };
      const opts = d.options.map((o, i) => `${'ABC'[i]}. ${o}`).join('\n');
      return {
        main: `❓星座クイズ！\n\n${d.question}\n\n${opts}\n\n正解はリプ欄で👇\n#星座クイズ #こんにゃん堂`,
        reply: `💡正解は…${d.answer}！\n\n${d.explanation}\n\n当たった人は❤️で教えて！`,
      };
    }
    default:
      return { main: JSON.stringify(data) };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postToX(text: string, replyToId?: string): Promise<string> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  const params: { text: string; reply?: { in_reply_to_tweet_id: string } } = { text };
  if (replyToId) params.reply = { in_reply_to_tweet_id: replyToId };
  const result = await client.v2.tweet(params);
  return result.data.id;
}

async function postToThreads(text: string, replyToId?: string): Promise<string> {
  const token = process.env.THREADS_ACCESS_TOKEN!;
  const userId = process.env.THREADS_USER_ID!;

  const createParams = new URLSearchParams({ media_type: 'TEXT', text, access_token: token });
  if (replyToId) createParams.set('reply_to_id', replyToId);

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
  const dateIdx = args.indexOf('--date');

  let targetDate: Date;
  if (dateIdx !== -1 && args[dateIdx + 1]) {
    targetDate = new Date(args[dateIdx + 1] + 'T00:00:00+09:00');
  } else {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const dayOfWeek = targetDate.getDay();
  const weekday = WEEKDAYS[dayOfWeek];
  const themeInfo = WEEKLY_THEMES[dayOfWeek];

  console.error(`📌 ${weekday}曜日の企画: ${themeInfo.theme}`);

  // 生成
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `あなたは「ノア」。SNSで星座占い投稿をする20代女子。タメ口で親しみやすい。JSON以外の文字は含めないで。不安を煽る表現禁止。`,
    messages: [{ role: 'user', content: themeInfo.prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') { console.error('❌ 予期しないレスポンス'); process.exit(1); }

  let data: Record<string, unknown>;
  try {
    let jsonText = block.text.trim();
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (match) jsonText = match[0];
    data = JSON.parse(jsonText);
  } catch {
    console.error('❌ JSONパースエラー:', block.text);
    process.exit(1);
  }

  const { main: mainText, reply: replyText } = formatPost(dayOfWeek, data);

  console.error(`✅ 生成完了（${mainText.length}文字）`);

  if (dryRun) {
    console.log(mainText);
    if (replyText) console.log('\n---リプ---\n' + replyText);
    console.error('⚠️ DRY RUN');
    return;
  }

  // X投稿
  if (!threadsOnly) {
    try {
      const tweetId = await postToX(mainText);
      console.error(`✅ X投稿: ${tweetId}`);
      if (replyText) {
        await sleep(10000);
        const replyId = await postToX(replyText, tweetId);
        console.error(`✅ Xリプ: ${replyId}`);
      }
    } catch (e: unknown) {
      console.error(`❌ X投稿失敗:`, e instanceof Error ? e.message : e);
    }
  }

  // Threads投稿
  if (!xOnly) {
    try {
      await sleep(5000);
      const postId = await postToThreads(mainText);
      console.error(`✅ Threads投稿: ${postId}`);
      if (replyText) {
        await sleep(10000);
        const replyId = await postToThreads(replyText, postId);
        console.error(`✅ Threadsリプ: ${replyId}`);
      }
    } catch (e: unknown) {
      console.error(`❌ Threads投稿失敗:`, e instanceof Error ? e.message : e);
    }
  }

  console.error('🎉 週間企画投稿完了！');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
