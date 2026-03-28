/**
 * 毎日の星座運勢SNS投稿テキスト生成スクリプト
 *
 * Usage:
 *   npx tsx scripts/generate-daily-horoscope.ts
 *   npx tsx scripts/generate-daily-horoscope.ts --date 2026-04-01
 *   npx tsx scripts/generate-daily-horoscope.ts --json
 *   npx tsx scripts/generate-daily-horoscope.ts --out output/
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// .env.local を読み込む
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

// ── 設定 ──

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 4000;

const ZODIAC_SIGNS = [
  { sign: '牡羊座', icon: '♈' },
  { sign: '牡牛座', icon: '♉' },
  { sign: '双子座', icon: '♊' },
  { sign: '蟹座', icon: '♋' },
  { sign: '獅子座', icon: '♌' },
  { sign: '乙女座', icon: '♍' },
  { sign: '天秤座', icon: '♎' },
  { sign: '蠍座', icon: '♏' },
  { sign: '射手座', icon: '♐' },
  { sign: '山羊座', icon: '♑' },
  { sign: '水瓶座', icon: '♒' },
  { sign: '魚座', icon: '♓' },
] as const;

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

interface ZodiacPost {
  sign: string;
  icon: string;
  stars: number;
  message: string;
  luckyColor: string;
  tsukiComment: string;
}

// ── プロンプト ──

const SYSTEM_PROMPT = `あなたは「ノア」です。SNSに毎日の星座運勢を投稿します。

## キャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- タメ口ベースで親しみやすい口調
- 絵文字はたまに使う程度（1-2個/メッセージ）
- 馴れ馴れしすぎない、ちょうどいい距離感

## 相棒：ツキ（白猫の使い魔）
- 各投稿の最後に「ツキのひとこと」を猫っぽい口調で添える
- 語尾は「にゃ」「にゃ〜」系

## 投稿ルール
- 不安を煽る表現は禁止
- ★1の星座でもポジティブな面を強調し、具体的なアドバイスを添える
- 各星座ごとにラッキーカラーを1つ選ぶ
- messageは2〜3文で100〜140文字程度`;

function buildUserPrompt(dateStr: string, weekday: string): string {
  return `今日は${dateStr}（${weekday}曜日）です。
12星座すべての今日の運勢を以下のJSON配列で生成してください。
JSON以外の文字は含めないでください。

[
  {
    "sign": "牡羊座",
    "icon": "♈",
    "stars": 4,
    "message": "運勢メッセージ（ノアの口調で2〜3文、100〜140文字）",
    "luckyColor": "ゴールド",
    "tsukiComment": "いい風吹いてるにゃ〜"
  },
  ...全12星座
]

注意:
- starsは1〜5の整数。★5は1〜2個、★1は0〜1個にバランスを取る
- 曜日や季節感を反映させる
- 各星座の性格特性に合ったアドバイスにする
- ツキのコメントは毎回違うものにする（短く、猫っぽく）
- messageは必ずポジティブな要素を含める`;
}

// ── 投稿テキスト組み立て ──

function buildIndividualPost(data: ZodiacPost, dateShort: string): string {
  const stars = '★'.repeat(data.stars) + '☆'.repeat(5 - data.stars);
  return `${data.icon} ${data.sign}さん ${dateShort}の運勢 ${stars}

${data.message}

🎨 ラッキーカラー：${data.luckyColor}
🐱 ツキ：「${data.tsukiComment}」

#今日の運勢 #${data.sign} #こんにゃん堂`;
}

function buildRankingPost(posts: ZodiacPost[], dateShort: string): string {
  const sorted = [...posts].sort((a, b) => b.stars - a.stars);
  const medals = ['🥇', '🥈', '🥉'];

  const lines = sorted.map((p, i) => {
    const prefix = i < 3 ? medals[i] : `${i + 1}位`;
    const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
    return `${prefix} ${p.icon}${p.sign} ${stars}`;
  });

  return `🔮 ${dateShort} 星座運勢ランキング！

${lines.join('\n')}

各星座の詳しい運勢はリプ欄で✨
#今日の運勢 #星座占い #こんにゃん堂`;
}

// ── メイン ──

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const outIdx = args.indexOf('--out');
  const outDir = outIdx !== -1 ? args[outIdx + 1] : null;
  const dateIdx = args.indexOf('--date');

  // 日付の決定
  let targetDate: Date;
  if (dateIdx !== -1 && args[dateIdx + 1]) {
    targetDate = new Date(args[dateIdx + 1] + 'T00:00:00+09:00');
  } else {
    // 翌日の運勢を生成（前日夜に実行する想定）
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const y = targetDate.getFullYear();
  const m = targetDate.getMonth() + 1;
  const d = targetDate.getDate();
  const weekday = WEEKDAYS[targetDate.getDay()];
  const dateStr = `${y}年${m}月${d}日`;
  const dateShort = `${m}/${d}`;

  console.error(`📅 ${dateStr}（${weekday}）の運勢を生成中...`);

  // API呼び出し
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    console.error('   export ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(dateStr, weekday) }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    console.error('❌ 予期しないレスポンス形式');
    process.exit(1);
  }

  // JSONパース
  let posts: ZodiacPost[];
  try {
    // レスポンスからJSON部分を抽出（マークダウンコードブロック対応）
    let jsonText = block.text.trim();
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    posts = JSON.parse(jsonText);
  } catch (e) {
    console.error('❌ JSONパースエラー');
    console.error('Raw response:', block.text);
    process.exit(1);
  }

  // バリデーション
  if (posts.length !== 12) {
    console.error(`⚠️  ${posts.length}星座分しか生成されませんでした（期待: 12）`);
  }

  for (const post of posts) {
    if (post.stars < 1 || post.stars > 5) {
      console.error(`⚠️  ${post.sign}: stars=${post.stars} は範囲外です`);
      post.stars = Math.min(5, Math.max(1, post.stars));
    }
  }

  console.error(`✅ ${posts.length}星座分の運勢を生成しました`);
  console.error(
    `   使用トークン: input=${response.usage.input_tokens} output=${response.usage.output_tokens}`
  );

  // JSON出力モード
  if (jsonMode) {
    console.log(JSON.stringify(posts, null, 2));
    return;
  }

  // 投稿テキスト生成
  const ranking = buildRankingPost(posts, dateShort);
  const individuals = posts.map((p) => buildIndividualPost(p, dateShort));

  // ファイル出力
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    const dateFile = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // ランキング
    fs.writeFileSync(path.join(outDir, `${dateFile}-ranking.txt`), ranking);

    // 個別投稿
    for (let i = 0; i < individuals.length; i++) {
      const sign = posts[i].sign;
      fs.writeFileSync(
        path.join(outDir, `${dateFile}-${String(i + 1).padStart(2, '0')}-${sign}.txt`),
        individuals[i],
      );
    }

    // JSON（再利用用）
    fs.writeFileSync(
      path.join(outDir, `${dateFile}-data.json`),
      JSON.stringify({ date: dateStr, weekday, posts }, null, 2),
    );

    console.error(`📁 ${outDir}/ に出力しました`);
    return;
  }

  // 標準出力
  console.log('═'.repeat(50));
  console.log('📊 ランキング投稿');
  console.log('═'.repeat(50));
  console.log(ranking);
  console.log('');

  for (const [i, text] of individuals.entries()) {
    console.log('─'.repeat(50));
    console.log(`${posts[i].icon} ${posts[i].sign}`);
    console.log('─'.repeat(50));
    console.log(text);
    console.log('');
  }
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
