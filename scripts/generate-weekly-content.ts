/**
 * 週間企画コンテンツ生成スクリプト
 *
 * 曜日ごとに異なるバズりやすいコンテンツを生成
 * 毎日の運勢投稿の後に追加で投稿する用
 *
 * Usage:
 *   npx tsx scripts/generate-weekly-content.ts
 *   npx tsx scripts/generate-weekly-content.ts --date 2026-04-01
 *   npx tsx scripts/generate-weekly-content.ts --json
 */

import './lib/env';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 曜日ごとの企画テーマ
const WEEKLY_THEMES: Record<number, { theme: string; prompt: string }> = {
  0: { // 日曜
    theme: '相性ランキング',
    prompt: `今週の星座相性ランキングを作ってください。

形式:
1. 最高の相性カップル3組（星座×星座 + 一言理由）
2. 今週注意な組み合わせ1組（ポジティブなアドバイス付き）

JSON形式で:
{
  "title": "今週の相性ランキング✨",
  "bestPairs": [
    {"pair": "牡羊座×獅子座", "reason": "一言理由"},
    {"pair": "...", "reason": "..."},
    {"pair": "...", "reason": "..."}
  ],
  "cautionPair": {"pair": "..×..", "advice": "ポジティブなアドバイス"}
}`,
  },
  1: { // 月曜
    theme: '星座あるある',
    prompt: `ランダムに1つの星座を選んで「あるある」ネタを3つ作ってください。
共感を呼ぶ、クスッと笑える内容で。

JSON形式で:
{
  "sign": "選んだ星座",
  "icon": "星座アイコン",
  "items": ["あるある1", "あるある2", "あるある3"]
}`,
  },
  2: { // 火曜
    theme: '星座別ランキング',
    prompt: `面白いテーマで星座ランキングTOP5を作ってください。
テーマ例: 「朝に強い星座」「推し活が激しい星座」「LINEの返信が遅い星座」「沼りやすい星座」等
意外性があって共感を呼ぶテーマを自分で選んでください。

JSON形式で:
{
  "rankingTitle": "○○な星座TOP5",
  "rankings": [
    {"rank": 1, "sign": "星座名", "icon": "アイコン", "comment": "一言コメント"},
    ...5位まで
  ]
}`,
  },
  3: { // 水曜
    theme: 'ノアのお悩み相談',
    prompt: `よくある悩み（恋愛・仕事・人間関係）を1つ取り上げて、
ノアがタロット1枚引いてアドバイスする投稿を作ってください。

JSON形式で:
{
  "worry": "お悩みの内容（1文）",
  "card": "タロットカード名",
  "cardEmoji": "関連する絵文字",
  "advice": "ノアのアドバイス（2〜3文）"
}`,
  },
  4: { // 木曜
    theme: '今週のラッキー○○',
    prompt: `全12星座の今週のラッキーアイテム・ラッキースポット・ラッキーフードのうち1つを選んで、
12星座分まとめて作ってください。

JSON形式で:
{
  "category": "ラッキーフード",
  "categoryEmoji": "🍕",
  "items": [
    {"sign": "牡羊座", "icon": "♈", "item": "アイテム名"},
    ...12星座分
  ]
}`,
  },
  5: { // 金曜
    theme: '週末おすすめ',
    prompt: `3つの星座をピックアップして、この週末におすすめの過ごし方を提案してください。
星座の性格に合った具体的な提案で。

JSON形式で:
{
  "picks": [
    {"sign": "星座名", "icon": "アイコン", "suggestion": "週末の過ごし方（1〜2文）"},
    {"sign": "...", "icon": "...", "suggestion": "..."},
    {"sign": "...", "icon": "...", "suggestion": "..."}
  ]
}`,
  },
  6: { // 土曜
    theme: '星座クイズ',
    prompt: `星座に関する楽しいクイズを1問作ってください。
選択肢3つ、正解は次の投稿で発表する形式。

JSON形式で:
{
  "question": "クイズの問題文",
  "options": ["選択肢A", "選択肢B", "選択肢C"],
  "answer": "正解の選択肢",
  "explanation": "解説（1〜2文）"
}`,
  },
};

const SYSTEM_PROMPT = `あなたは「ノア」です。SNSで星座占い関連の投稿をします。

## キャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- タメ口ベースで親しみやすい口調
- 絵文字はたまに使う程度
- 馴れ馴れしすぎない、ちょうどいい距離感

## ルール
- JSON以外の文字は含めないでください
- 不安を煽る表現は禁止
- ネガティブな内容でもポジティブに変換する
- 共感を呼ぶ、シェアしたくなる内容にする`;

// 投稿テキスト組み立て
function formatPost(theme: string, data: Record<string, unknown>): string {
  switch (theme) {
    case '相性ランキング': {
      const d = data as { title: string; bestPairs: { pair: string; reason: string }[]; cautionPair: { pair: string; advice: string } };
      const pairs = d.bestPairs.map((p, i) => `${['🥇', '🥈', '🥉'][i]} ${p.pair}\n   ${p.reason}`).join('\n');
      return `💕 ${d.title}\n\n${pairs}\n\n⚠️ ${d.cautionPair.pair}\n→ ${d.cautionPair.advice}\n\n#星座占い #相性 #こんにゃん堂`;
    }
    case '星座あるある': {
      const d = data as { sign: string; icon: string; items: string[] };
      const items = d.items.map((item, i) => `${i + 1}. ${item}`).join('\n');
      return `${d.icon} ${d.sign}あるある\n\n${items}\n\n当てはまったら❤️で教えて！\n#星座あるある #${d.sign} #こんにゃん堂`;
    }
    case '星座別ランキング': {
      const d = data as { rankingTitle: string; rankings: { rank: number; sign: string; icon: string; comment: string }[] };
      const lines = d.rankings.map(r => `${r.rank}位 ${r.icon}${r.sign}：${r.comment}`).join('\n');
      return `🏆 ${d.rankingTitle}\n\n${lines}\n\nあなたは何位だった？\n#星座ランキング #こんにゃん堂`;
    }
    case 'ノアのお悩み相談': {
      const d = data as { worry: string; card: string; cardEmoji: string; advice: string };
      return `📮 お悩み：${d.worry}\n\n🔮 出たカード：${d.cardEmoji}${d.card}\n\n${d.advice}\n\nみんなも相談あったらリプしてね！\n#タロット #お悩み相談 #こんにゃん堂`;
    }
    case '今週のラッキー○○': {
      const d = data as { category: string; categoryEmoji: string; items: { sign: string; icon: string; item: string }[] };
      const lines = d.items.map(i => `${i.icon}${i.sign}→${i.item}`).join('\n');
      return `${d.categoryEmoji} 今週の${d.category}\n\n${lines}\n\n#星座占い #こんにゃん堂`;
    }
    case '週末おすすめ': {
      const d = data as { picks: { sign: string; icon: string; suggestion: string }[] };
      const lines = d.picks.map(p => `${p.icon}${p.sign}\n→ ${p.suggestion}`).join('\n\n');
      return `🎉 週末のおすすめ\n\n${lines}\n\n素敵な週末を！\n#週末 #星座占い #こんにゃん堂`;
    }
    case '星座クイズ': {
      const d = data as { question: string; options: string[]; answer: string; explanation: string };
      const opts = d.options.map((o, i) => `${'ABC'[i]}. ${o}`).join('\n');
      return `❓ 星座クイズ！\n\n${d.question}\n\n${opts}\n\n正解はリプ欄で👇\n#星座クイズ #こんにゃん堂`;
    }
    default:
      return JSON.stringify(data, null, 2);
  }
}

function formatAnswer(data: Record<string, unknown>): string | null {
  if ('answer' in data && 'explanation' in data) {
    const d = data as { answer: string; explanation: string };
    return `💡 正解は…\n\n${d.answer}！\n\n${d.explanation}\n\n当たった人は❤️で教えて！`;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
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

  console.error(`📅 ${weekday}曜日の企画: ${themeInfo.theme}`);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: themeInfo.prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    console.error('❌ 予期しないレスポンス形式');
    process.exit(1);
  }

  let data: Record<string, unknown>;
  try {
    let jsonText = block.text.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];
    data = JSON.parse(jsonText);
  } catch {
    console.error('❌ JSONパースエラー');
    console.error('Raw:', block.text);
    process.exit(1);
  }

  console.error(`✅ 生成完了（tokens: in=${response.usage.input_tokens} out=${response.usage.output_tokens}）`);

  if (jsonMode) {
    console.log(JSON.stringify({ theme: themeInfo.theme, dayOfWeek, data }, null, 2));
    return;
  }

  const postText = formatPost(themeInfo.theme, data);
  const answerText = formatAnswer(data);

  console.log('═'.repeat(50));
  console.log(`📌 ${themeInfo.theme}（${weekday}曜日）`);
  console.log('═'.repeat(50));
  console.log(postText);
  console.log(`\n文字数: ${postText.length}`);

  if (answerText) {
    console.log('\n' + '─'.repeat(50));
    console.log('💡 回答投稿（リプ用）');
    console.log('─'.repeat(50));
    console.log(answerText);
    console.log(`\n文字数: ${answerText.length}`);
  }
}

main().catch((e) => {
  console.error('❌ エラー:', e.message);
  process.exit(1);
});
