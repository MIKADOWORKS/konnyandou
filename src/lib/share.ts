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
  _cardName: string,
  _cardNameEn: string,
  _cardEmoji: string,
  _isReversed: boolean
): string {
  return SITE_URL;
}

export function buildSpreadShareUrl(
  _cards: { name: string; emoji: string; isReversed: boolean }[]
): string {
  return SITE_URL;
}

export function buildZodiacShareUrl(
  _sign: string,
  _signIcon: string,
  _overallStars: number
): string {
  return SITE_URL;
}

export function buildCompatibilityShareText(
  person1: string, sign1: string, icon1: string,
  person2: string, sign2: string, icon2: string,
  score: number, reading: string
): string {
  const shortReading = reading.length > 80 ? reading.slice(0, 80) + '…' : reading;
  const p1label = person1 ? `${person1}（${sign1}）` : `${icon1}${sign1}`;
  const p2label = person2 ? `${person2}（${sign2}）` : `${icon2}${sign2}`;
  return `💕 ${p1label} × ${p2label} の相性スコア: ${score}点\n\n${shortReading}\n\n#こんにゃん堂 #相性占い`;
}

export function buildCompatibilityShareUrl(
  _person1: string, _sign1: string, _icon1: string,
  _person2: string, _sign2: string, _icon2: string,
  _score: number
): string {
  return SITE_URL;
}
