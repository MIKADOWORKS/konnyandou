import { SITE_URL } from './constants';

interface ShareParams {
  text: string;
  url?: string;
}

export function shareToTwitter({ text, url }: ShareParams) {
  const params = new URLSearchParams({ text });
  if (url) params.set('url', url);
  window.open(
    `https://twitter.com/intent/tweet?${params.toString()}`,
    '_blank',
    'noopener,noreferrer,width=550,height=420'
  );
}

export function shareToLine({ text, url }: ShareParams) {
  const message = url ? `${text}\n${url}` : text;
  window.open(
    `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url || SITE_URL)}&text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  );
}

export function buildTarotShareText(
  cardName: string,
  cardNameEn: string,
  isReversed: boolean,
  reading: string
): string {
  const position = isReversed ? '逆位置' : '正位置';
  const shortReading = reading.length > 80 ? reading.slice(0, 80) + '…' : reading;
  return `🔮 今日のタロット：${cardName}（${cardNameEn}）${position}\n\nノアの解釈：${shortReading}\n\n#こんにゃん堂 #タロット占い`;
}

export function buildZodiacShareText(
  sign: string,
  overall: number,
  reading: string
): string {
  const stars = '★'.repeat(overall) + '☆'.repeat(5 - overall);
  const shortReading = reading.length > 80 ? reading.slice(0, 80) + '…' : reading;
  return `${sign}の今日の運勢 ${stars}\n\n${shortReading}\n\n#こんにゃん堂 #星座占い`;
}

// --- Dynamic share URL builders ---

export function buildTarotShareUrl(
  cardName: string,
  cardNameEn: string,
  cardEmoji: string,
  isReversed: boolean
): string {
  const params = new URLSearchParams({
    type: 'tarot',
    card: cardName,
    en: cardNameEn,
    emoji: cardEmoji,
    rev: isReversed ? '1' : '0',
  });
  return `${SITE_URL}/share?${params.toString()}`;
}

export function buildSpreadShareUrl(
  cards: { name: string; emoji: string; isReversed: boolean }[]
): string {
  const params = new URLSearchParams({ type: 'spread' });
  cards.forEach((card, i) => {
    params.set(`c${i}`, card.name);
    params.set(`e${i}`, card.emoji);
    params.set(`r${i}`, card.isReversed ? '1' : '0');
  });
  return `${SITE_URL}/share?${params.toString()}`;
}

export function buildZodiacShareUrl(
  sign: string,
  signIcon: string,
  overallStars: number
): string {
  const params = new URLSearchParams({
    type: 'zodiac',
    sign,
    icon: signIcon,
    stars: String(overallStars),
  });
  return `${SITE_URL}/share?${params.toString()}`;
}
