import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

interface SharePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const v = params[key];
  return typeof v === 'string' ? v : '';
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const type = getParam(params, 'type');

  // Build the OG image URL with the same params
  const ogParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') ogParams.set(k, v);
  }
  const ogImageUrl = `${SITE_URL}/api/og?${ogParams.toString()}`;

  let title = `占い結果 | ${SITE_NAME}`;
  let description = 'ノアが占った結果をチェック！あなたも占ってみませんか？';

  if (type === 'tarot') {
    const card = getParam(params, 'card');
    const rev = getParam(params, 'rev') === '1' ? '逆位置' : '正位置';
    title = `タロット：${card}（${rev}）| ${SITE_NAME}`;
    description = `ノアのタロット占いで「${card}」（${rev}）が出ました！あなたも占ってみませんか？`;
  } else if (type === 'spread') {
    const cards = [0, 1, 2].map((i) => getParam(params, `c${i}`)).filter(Boolean);
    title = `タロット3枚：${cards.join('・')} | ${SITE_NAME}`;
    description = `ノアのタロット3枚スプレッドの結果をチェック！あなたも占ってみませんか？`;
  } else if (type === 'zodiac') {
    const sign = getParam(params, 'sign');
    const stars = Number(getParam(params, 'stars')) || 3;
    const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    title = `${sign}の今日の運勢 ${starStr} | ${SITE_NAME}`;
    description = `${sign}の今日の運勢は${starStr}！ノアの占いであなたの星座も占ってみませんか？`;
  } else if (type === 'compatibility') {
    const s1 = getParam(params, 's1');
    const s2 = getParam(params, 's2');
    const score = Number(getParam(params, 'score')) || 0;
    title = `${s1} × ${s2} の相性スコア${score}点 | ${SITE_NAME}`;
    description = `${s1}と${s2}の相性スコアは${score}点！あなたも相性占いをしてみませんか？`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/share?${ogParams.toString()}`,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams;
  const type = getParam(params, 'type');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      {type === 'tarot' && <TarotShareContent params={params} />}
      {type === 'spread' && <SpreadShareContent params={params} />}
      {type === 'zodiac' && <ZodiacShareContent params={params} />}
      {type === 'compatibility' && <CompatibilityShareContent params={params} />}
      {!['tarot', 'spread', 'zodiac', 'compatibility'].includes(type) && (
        <div className="text-knd-lavender/60">占い結果が見つかりませんでした</div>
      )}

      <Link
        href={type === 'compatibility' ? '/compatibility' : type === 'zodiac' ? '/' : '/tarot'}
        className="mt-8 px-8 py-3 rounded-full bg-knd-purple text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
      >
        自分も占ってみる →
      </Link>

      <Link
        href="/"
        className="mt-4 text-knd-lavender/50 text-sm hover:text-knd-lavender/80 transition-colors"
      >
        こんにゃん堂トップへ
      </Link>
    </div>
  );
}

function TarotShareContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const card = getParam(params, 'card');
  const en = getParam(params, 'en');
  const emoji = getParam(params, 'emoji') || '🃏';
  const reversed = getParam(params, 'rev') === '1';

  return (
    <div className="animate-fadeSlideIn">
      <div className="text-knd-lavender/60 text-sm tracking-wider mb-4">
        🔮 タロット占い結果
      </div>
      <div className="text-6xl mb-3">{emoji}</div>
      <h1 className="text-3xl font-bold text-knd-gold mb-1">{card}</h1>
      <div className="text-knd-lavender/70 text-sm mb-2">{en}</div>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs ${
          reversed
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}
      >
        {reversed ? '逆位置' : '正位置'}
      </span>
    </div>
  );
}

function SpreadShareContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const positions = ['過去', '現在', '未来'];
  const cards = [0, 1, 2].map((i) => ({
    name: getParam(params, `c${i}`),
    emoji: getParam(params, `e${i}`) || '🃏',
    reversed: getParam(params, `r${i}`) === '1',
  }));

  return (
    <div className="animate-fadeSlideIn">
      <div className="text-knd-lavender/60 text-sm tracking-wider mb-6">
        🔮 タロット3枚スプレッド結果
      </div>
      <div className="flex gap-4 justify-center">
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-3 rounded-xl bg-knd-lavender/5 border border-knd-lavender/10 w-[110px]"
          >
            <div className="text-knd-lavender/50 text-xs mb-2">{positions[i]}</div>
            <div className="text-3xl mb-1">{card.emoji}</div>
            <div className="text-sm font-bold text-knd-gold">{card.name}</div>
            <span
              className={`mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                card.reversed
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {card.reversed ? '逆' : '正'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZodiacShareContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const sign = getParam(params, 'sign');
  const icon = getParam(params, 'icon') || '⭐';
  const stars = Math.min(5, Math.max(1, Number(getParam(params, 'stars')) || 3));

  return (
    <div className="animate-fadeSlideIn">
      <div className="text-knd-lavender/60 text-sm tracking-wider mb-4">
        ⭐ 今日の運勢
      </div>
      <div className="text-6xl mb-3">{icon}</div>
      <h1 className="text-3xl font-bold text-knd-gold mb-3">{sign}</h1>
      <div className="text-3xl tracking-wider">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < stars ? 'text-knd-gold' : 'text-knd-lavender/20'}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

function CompatibilityShareContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const p1 = getParam(params, 'p1');
  const s1 = getParam(params, 's1');
  const i1 = getParam(params, 'i1') || '⭐';
  const p2 = getParam(params, 'p2');
  const s2 = getParam(params, 's2');
  const i2 = getParam(params, 'i2') || '⭐';
  const score = Math.min(100, Math.max(0, Number(getParam(params, 'score')) || 0));

  return (
    <div className="animate-fadeSlideIn w-full max-w-sm">
      <div className="text-knd-lavender/60 text-sm tracking-wider mb-6">
        💕 相性占い結果
      </div>
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex flex-col items-center gap-1">
          <div className="text-5xl">{i1}</div>
          <div className="text-sm font-bold text-knd-gold">{s1}</div>
          {p1 && <div className="text-xs text-knd-lavender/60">{p1}</div>}
        </div>
        <div className="text-2xl text-knd-lavender/40">×</div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-5xl">{i2}</div>
          <div className="text-sm font-bold text-knd-gold">{s2}</div>
          {p2 && <div className="text-xs text-knd-lavender/60">{p2}</div>}
        </div>
      </div>
      <div className="text-6xl font-bold text-knd-gold mb-1">{score}</div>
      <div className="text-knd-lavender/50 text-sm">点</div>
    </div>
  );
}
