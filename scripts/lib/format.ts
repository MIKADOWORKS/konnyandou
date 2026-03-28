import type { ZodiacPost } from './types';

export function buildIndividualPost(data: ZodiacPost, dateShort: string): string {
  const stars = '★'.repeat(data.stars) + '☆'.repeat(5 - data.stars);
  return `${data.icon} ${data.sign}さん ${dateShort}の運勢 ${stars}

${data.message}

🎨 ラッキーカラー：${data.luckyColor}
🐱 ツキ：「${data.tsukiComment}」

#今日の運勢 #${data.sign} #こんにゃん堂`;
}

export function buildRankingPost(posts: ZodiacPost[], dateShort: string): string {
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
