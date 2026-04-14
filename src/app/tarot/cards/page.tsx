import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { TAROT_MAJOR_ARCANA } from '@/lib/tarot-cards-data';
import { majorArcana } from '@/lib/tarot-data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { getWebPageJsonLd } from '@/lib/jsonld';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';

function getCardImagePath(number: number): string | null {
  const legacy = majorArcana.find((c) => c.id === number);
  return legacy?.image ?? null;
}

export const metadata: Metadata = {
  title: `タロット大アルカナ22枚の意味一覧 | ${SITE_NAME}`,
  description:
    'タロット大アルカナ22枚（愚者から世界まで）の意味・キーワードを一覧で解説。正位置・逆位置の解釈や恋愛・仕事・金運のメッセージをノアがお届けします。',
  openGraph: {
    title: `タロット大アルカナ22枚の意味一覧 | ${SITE_NAME}`,
    description:
      'タロット大アルカナ22枚の意味・キーワード・正位置/逆位置の解釈を一覧で解説。',
    url: `${SITE_URL}/tarot/cards`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `タロット大アルカナ22枚の意味一覧 | ${SITE_NAME}`,
    description:
      'タロット大アルカナ22枚の意味・キーワードを一覧で解説。',
  },
  alternates: {
    canonical: `${SITE_URL}/tarot/cards`,
  },
};

export default function TarotCardsIndexPage() {
  const jsonLd = getWebPageJsonLd({
    name: 'タロット大アルカナ22枚の意味一覧',
    description: 'タロット大アルカナ22枚の意味・キーワードを一覧で解説。',
    url: `${SITE_URL}/tarot/cards`,
  });

  return (
    <div className="relative min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StarField />
      <ConstellationDecor className="top-20 -right-8 w-[180px]" />

      <div className="relative z-10 px-5 pt-12 pb-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeSlideIn">
          <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-2 font-body">
            MAJOR ARCANA · 22 CARDS
          </div>
          <h1 className="text-[22px] font-display font-medium text-knd-gold tracking-[2px] mb-2">
            大アルカナ 22枚の意味
          </h1>
          <p className="text-[12px] text-knd-lavender/60 leading-[1.8]">
            愚者から世界まで、タロット大アルカナ全22枚の解説一覧です。
            <br />
            気になるカードをタップして詳細をご覧ください。
          </p>
        </div>

        <div className="space-y-2.5">
          {TAROT_MAJOR_ARCANA.map((card, i) => {
            const imagePath = getCardImagePath(card.number);
            return (
              <Link
                key={card.slug}
                href={`/tarot/cards/${card.slug}`}
                className="block bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-3 transition-colors hover:border-knd-gold/30 animate-fadeSlideIn"
                style={{
                  animationDelay: `${0.05 * Math.min(i, 10) + 0.1}s`,
                  animationFillMode: 'backwards',
                }}
              >
                <div className="flex items-center gap-3">
                  {imagePath ? (
                    <div className="shrink-0 relative w-[54px] aspect-[2/3] rounded-md overflow-hidden border border-knd-gold/25 bg-knd-indigo/60">
                      <Image
                        src={imagePath}
                        alt={`${card.name}のカード`}
                        fill
                        sizes="54px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-knd-indigo/60 border border-knd-gold/30 flex items-center justify-center">
                      <span className="text-[13px] text-knd-gold font-display font-bold">
                        {card.number}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] text-knd-gold/70 font-body tracking-wider">
                        {String(card.number).padStart(2, '0')}
                      </span>
                      <p className="text-[15px] text-knd-lavender font-bold truncate">
                        {card.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-knd-lavender/50 font-body mb-1.5 truncate">
                      {card.nameEn}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="text-[10px] text-knd-lavender/70 bg-knd-indigo/50 border border-knd-lavender/10 rounded-full px-2 py-0.5"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-knd-lavender/40 text-base shrink-0">›</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back to tarot */}
        <div className="mt-8 text-center">
          <div className="border-t border-knd-lavender/20 my-4" />
          <Link
            href="/tarot"
            className="inline-block text-[13px] text-knd-gold/80 hover:text-knd-gold transition-colors underline underline-offset-4"
          >
            タロットトップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
