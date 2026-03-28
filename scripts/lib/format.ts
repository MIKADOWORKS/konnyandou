import type { ZodiacPost } from './types';

// ── 個別投稿のバリエーション ──

// ヘッダーパターン（毎回同じ見た目にならないようにする）
const HEADER_PATTERNS: ((data: ZodiacPost, dateShort: string, stars: string) => string)[] = [
  (d, ds, s) => `${d.icon} ${d.sign}さん ${ds}の運勢 ${s}`,
  (d, ds, s) => `${ds} ${d.icon}${d.sign} ${s}`,
  (d, ds, s) => `${d.icon} ${d.sign} ${ds}\n${s}`,
];

// ツキのひとこと表示パターン
const TSUKI_PATTERNS: ((comment: string) => string)[] = [
  (c) => `🐱 ツキ：「${c}」`,
  (c) => `🐱「${c}」`,
  (c) => `ツキ「${c}」`,
];

// ラッキーカラー表示パターン
const COLOR_PATTERNS: ((color: string) => string)[] = [
  (c) => `🎨 ラッキーカラー：${c}`,
  (c) => `🎨 ${c}`,
  (c) => `ラッキーカラー: ${c}`,
];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function buildIndividualPost(data: ZodiacPost, dateShort: string): string {
  const stars = '★'.repeat(data.stars) + '☆'.repeat(5 - data.stars);
  // 星座名からシード値を作ってパターン分散（同日内で星座ごとに違うパターンになる）
  const seed = data.sign.charCodeAt(0) + data.stars;
  const header = pickRandom(HEADER_PATTERNS, seed)(data, dateShort, stars);
  const tsuki = pickRandom(TSUKI_PATTERNS, seed + 1)(data.tsukiComment);
  const color = pickRandom(COLOR_PATTERNS, seed + 2)(data.luckyColor);

  return `${header}

${data.message}

${color}
${tsuki}

#今日の運勢 #${data.sign} #こんにゃん堂`;
}

// ── ランキング投稿のバリエーション ──

const RANKING_INTROS: string[] = [
  '運勢ランキング',
  'きょうの運勢',
  '今日の星座ランキング',
];

const RANKING_OUTROS: string[] = [
  '詳しい運勢はリプ欄で',
  '各星座の詳細はリプ欄',
  'あなたの星座は何位？ 詳細はリプ欄',
];

export function buildRankingPost(posts: ZodiacPost[], dateShort: string): string {
  const sorted = [...posts].sort((a, b) => b.stars - a.stars);
  const medals = ['🥇', '🥈', '🥉'];

  // 日付からシード値を作ってパターン分散
  const daySeed = parseInt(dateShort.replace('/', ''), 10) || 0;
  const intro = pickRandom(RANKING_INTROS, daySeed);
  const outro = pickRandom(RANKING_OUTROS, daySeed + 1);

  // X の280文字制限に収まるよう、星表示を省略してコンパクトに
  const lines = sorted.map((p, i) => {
    const prefix = i < 3 ? medals[i] : `${String(i + 1).padStart(2, ' ')}`;
    return `${prefix}${p.icon}${p.sign}`;
  });

  return `🔮${dateShort} ${intro}

${lines.join('\n')}

${outro}
#今日の運勢 #こんにゃん堂`;
}
