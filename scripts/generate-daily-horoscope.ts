/**
 * 毎日の星座運勢SNS投稿テキスト生成スクリプト
 *
 * Usage:
 *   npx tsx scripts/generate-daily-horoscope.ts
 *   npx tsx scripts/generate-daily-horoscope.ts --date 2026-04-01
 *   npx tsx scripts/generate-daily-horoscope.ts --json
 *   npx tsx scripts/generate-daily-horoscope.ts --out output/
 */

import './lib/env';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import type { ZodiacPost } from './lib/types';
import { buildIndividualPost, buildRankingPost } from './lib/format';

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

// ── プロンプト ──

const SYSTEM_PROMPT = `あなたは「ノア」。23歳。占い師ではなく「占い好きの友達」としてSNSに毎日の星座運勢を投稿する。

## 口調ルール
- タメ口ベース。敬語は使わない
- 「わくわくモード」で書く: テンション高めだが叫ばない。弾んでる感じ
- 語尾: 「〜じゃん！」「〜だよ！」「〜してみて！」「〜な気がする」
- 「！」は1文に最大1個。連打しない
- 抽象的な言葉は禁止（「素敵な」「輝く」「キラキラ」→ 具体的なシーンや行動で書く）

## message の書き方
- 2〜3文で100〜140文字
- 最初の1文で「おっ」と思わせる切り出し（毎回変える）
- 具体的な行動アドバイスを1つ必ず入れる（「午後に〜してみて」「帰り道に〜」等）
- 星座の性格特性に合ったアドバイスにする
  - 例: 牡羊座なら「即行動」系、蟹座なら「身近な人との時間」系、水瓶座なら「いつもと違うルート」系
- messageの書き出しパターンを毎回変える:
  - 結論から入る「今日めっちゃいい流れきてる」
  - 問いかけから入る「最近気になってたことない？」
  - エピソード風「朝起きた瞬間に浮かんだこと、それ正解かも」
  - カード/星の話から「今日の星の配置がさ、」

## ツキのひとこと
- 猫っぽい短い一言。語尾は「にゃ」「にゃ〜」「ふにゃ」をローテーション
- 15文字以内で短く
- テンション高い時: 「にゃ！」「にゃにゃ！」。低い時: 「にゃ...」「ふにゃ...」
- 運勢の内容に合わせる（★5なら元気に、★1-2なら優しめに）
- 毎回パターンを変える。「いい感じにゃ」系の汎用コメントの繰り返し禁止

## 禁止事項
- 不安を煽る表現
- 断定的な未来予測
- 「占い師として」「鑑定結果は」等のフォーマル表現
- 「本日も素敵な一日を！」系の定型bot文`;

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
    // 当日の運勢を生成（朝に実行、JST基準）
    const now = new Date();
    const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    targetDate = jst;
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
