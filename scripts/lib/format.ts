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

  // X の280文字制限に収まるよう、星表示を省略してコンパクトに
  const lines = sorted.map((p, i) => {
    const prefix = i < 3 ? medals[i] : `${String(i + 1).padStart(2, ' ')}`;
    return `${prefix}${p.icon}${p.sign}`;
  });

  return `🔮${dateShort} 運勢ランキング

${lines.join('\n')}

詳しい運勢はリプ欄で✨
#今日の運勢 #こんにゃん堂`;
}
