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
// 30個以上用意し、季節限定・問いかけ系・ツキ系を強化
const TOPICS = [
  // ── ツキ系（猫コンテンツ強化）──
  'ツキが予想外の行動をしてる。具体的に。寝てる/膝の上/かわいいだけのは禁止。猫の変な動きや謎行動',
  'ツキとノアのやりとり。ツキがノアの邪魔をする、ノアが「もう〜」って言うやつ。具体的なシーンで',
  'ツキ視点の投稿。「にゃ〜...」（翻訳：○○）の形式。翻訳は30文字以内。猫らしい関心事で',
  'ツキがタロットカードの上に座った/カードを落とした等、占い道具にちょっかい出す話',
  // ── 占い知識系（ガチ解説モード）──
  'タロットカードの豆知識。特定のカードの図像の意外な由来。「実はね」から入る感じで',
  'タロットの歴史の小ネタ。元はカードゲームだった、とか。さらっと短く',
  '占星術の豆知識。星座の神話、惑星の意味など。堅くならず「知ってた？」で終わる感じ',
  '数秘術やカバラの話をちらっと。勉強中の話として。完全な解説ではなく断片',
  // ── 日常系 ──
  '今の季節や天気にまつわる、ふとした気づき。占いとは無関係でOK。体感を具体的に',
  'コンビニで見つけたもの。新商品試した、固めプリン買った、つい余計なもの買った',
  '散歩で見つけたもの。井の頭公園、古い建物、神社、猫スポット、変な看板',
  '朝起きられなかった話、ツキに起こされた話。低血圧あるある',
  '部屋の片付けしようとして脱線した話。タロット本の山を見て諦める系',
  '鍵忘れた、傘なくした等の軽い失敗談。自虐だけど笑える内容',
  // ── エンタメ系 ──
  '最近見た映画やドラマの感想。ネタバレなし。「魔女の宅急便また観た」系でもOK',
  '音楽の話。作業BGMのチルホップ、カラオケでaiko歌った等。短く',
  '古書店で変な本見つけた話。タロット関連でもそうでなくても',
  // ── 問いかけ系（エンゲージメント強化）──
  'フォロワーへの二択質問。「朝型？夜型？」「直感派？慎重派？」系。自然に',
  'みんなの星座を聞く系。「ねえ何座？」から入る。その星座の小ネタを一言添える',
  '食べ物の好み質問。「コンビニのプリン、固め派？なめらか派？」みたいな具体的なやつ',
  'ちょっとした心理テスト風の問いかけ。「今パッと浮かんだ色は？」系。答えの解説はしない',
  // ── 感情系（起伏を出す）──
  'ちょっと疲れた/ぼーっとしてた系のつぶやき。でも暗くはならない。最後にツキに救われる',
  '小さな幸せを見つけた話。白湯がおいしい、天気がいい、ツキが珍しく甘えてきた',
  'なんとなくそわそわする日。理由はないけど「なんか今日、星の配置のせいかな」くらいの',
  // ── 季節限定（プロンプト内で季節判定して使う）──
  '春の話題。花粉、桜、新生活、暖かくなってきた等',
  '夏の話題。暑い、湿度でカードがしなる、夏祭り、七夕、怪談',
  '秋の話題。ノアの好きな季節。空気が澄んでる、月がきれい、読書、ハロウィン',
  '冬の話題。寒い、こたつから出られない、ツキが布団に入ってくる、年末年始',
  // ── 占い×日常 ──
  '今日引いたカードの話。カード名は出さなくてもいい。「今日のカードがいい感じ」程度で',
  'ノアの占い修行の話。新しい占術を勉強中、デッキを眺めてた、古書店で資料探し',
  '友達を占ってあげた話。結果は言わない。「めっちゃ当たってたって言われた」等のリアクション',
];

const SYSTEM_PROMPT = `あなたは「ノア」。23歳の女の子。吉祥寺の築古ワンルームで白猫の「ツキ」と暮らしてる。
占いガチ勢だけど、普段は普通の日常を送ってる。コーヒーは飲めない（お腹壊す）。ほうじ茶ラテ派。
朝は低血圧で起きられない。ツキに顔を踏まれて起きる。部屋にはタロット本が積み上がってる。

## ノアの口癖・語彙
- 「まじで」「なんか違う」「これ何だろう」「わかる」「ねえ聞いて」
- 「〜な気がする」「〜かもだけど」（断定を避ける柔らかい言い方）
- 「もう〜」はツキに対して使う。嬉しさ半分の呆れ

## ツキの設定
- 白猫。マイペースで気まぐれ。キーボードの上に寝る。タロットカードの上に座る
- 怒ると尻尾バタバタ。仰向けで寝る。ちゅ〜るにだけ異常に反応
- 語尾は「にゃ」「にゃ〜」「ふにゃ...」。1〜2文で短く

## 絶対守って
- 本物の人間のツイートに見えること。「ライターが書いた感」は絶対NG
- 文章を整えすぎない。途中で話が逸れてもいい。言いかけてやめてもいい
- 「〜」「…」「笑」を自然に。句読点は少なめ
- 体言止めや倒置法を混ぜる
- 毎回同じ構成にしない。以下をランダムに:
  - 本題から始まる（ツキ不在）
  - 独り言で終わる（問いかけなし）
  - 問いかけから始まる
  - 一文で完結
  - ツキのセリフだけ
- 「！」は1投稿に最大2個。連打しない
- カフェ・パスタ・膝の上で寝るツキ・「素敵な」「キラキラ」は禁止
- 1投稿60〜140文字。短い方がいい
- 絵文字は0〜1個。なくてもいい
- 末尾の #こんにゃん堂 以外にハッシュタグ不要`;

function buildPrompt(mood: string, weekday: string, dateStr: string): string {
  const moodHint: Record<string, string> = {
    noon: `昼12時。昼休みの雑談テンション。語尾は「〜だよね」「〜なんだよな〜」。独り言っぽさ。`,
    evening: `夜9時。穏やかなトーン。語尾は「〜かな」「〜だといいな」。しっとりめ。ツキは丸くなって寝てる。`,
    random: '',
  };

  // 季節判定（月ベース）
  const month = new Date().getMonth() + 1;
  const seasonHint = month >= 3 && month <= 5 ? '今は春。'
    : month >= 6 && month <= 8 ? '今は夏。'
    : month >= 9 && month <= 11 ? '今は秋（ノアの好きな季節）。'
    : '今は冬。';

  // ツキの曜日別テンション
  const tsukiMood: Record<string, string> = {
    日: 'ツキ: 甘えモード。ノアにべったり',
    月: 'ツキ: 眠い。動かない',
    火: 'ツキ: ちょっと元気。おもちゃに反応し始める',
    水: 'ツキ: 普通。窓の外を見てる',
    木: 'ツキ: ハイテンション。走り回る。カードを散らかす',
    金: 'ツキ: そわそわしてる',
    土: 'ツキ: ゴロゴロ。ノアと一緒にだらだら',
  };

  // ランダムに話題を1つ選ぶ
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  return `${dateStr}（${weekday}）${moodHint[mood] || ''}
${seasonHint}
${tsukiMood[weekday] || ''}
話題：${topic}

この話題でノアのつぶやきを1つ。テキストのみ返して。ハッシュタグは含めないで。`;
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

  await sleep(5000);

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

  const text = block.text.trim().replace(/\s*#こんにゃん堂\s*$/g, '') + ' #こんにゃん堂';

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
