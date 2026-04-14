import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TAROT_MAJOR_ARCANA } from '@/lib/tarot-cards-data';
import { majorArcana } from '@/lib/tarot-data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { getWebPageJsonLd } from '@/lib/jsonld';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import TarotCardZoomImage from '@/components/tarot/TarotCardZoomImage';

function getCardImagePath(number: number): string | null {
  const legacy = majorArcana.find((c) => c.id === number);
  return legacy?.image ?? null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TAROT_MAJOR_ARCANA.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = TAROT_MAJOR_ARCANA.find((c) => c.slug === slug);
  if (!card) return {};

  const title = `${card.name}（${card.nameEn}）の意味 | ${SITE_NAME}`;
  const description = `タロット大アルカナ「${card.name}（${card.nameEn}）」の意味・正位置/逆位置・恋愛/仕事/金運のメッセージを解説。${card.meaning.slice(0, 80)}`;
  const url = `${SITE_URL}/tarot/cards/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function TarotCardPage({ params }: Props) {
  const { slug } = await params;
  const card = TAROT_MAJOR_ARCANA.find((c) => c.slug === slug);
  if (!card) notFound();

  const idx = TAROT_MAJOR_ARCANA.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? TAROT_MAJOR_ARCANA[idx - 1] : null;
  const next = idx < TAROT_MAJOR_ARCANA.length - 1 ? TAROT_MAJOR_ARCANA[idx + 1] : null;

  const imagePath = getCardImagePath(card.number);

  const jsonLd = getWebPageJsonLd({
    name: `${card.name}（${card.nameEn}）の意味`,
    description: card.meaning.slice(0, 120),
    url: `${SITE_URL}/tarot/cards/${slug}`,
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
        <div className="text-center mb-6 animate-fadeSlideIn">
          <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-2 font-body">
            MAJOR ARCANA · {String(card.number).padStart(2, '0')}
          </div>
          <h1 className="text-[24px] font-display font-medium text-knd-gold tracking-[2px] mb-1">
            {card.name}
          </h1>
          <p className="text-[12px] text-knd-lavender/60 tracking-[2px] font-body">
            {card.nameEn}
          </p>

          {/* Card image (tap to zoom) */}
          {imagePath && (
            <div
              className="mt-5 flex justify-center animate-fadeSlideIn"
              style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}
            >
              <TarotCardZoomImage
                src={imagePath}
                alt={`${card.name}（${card.nameEn}）のタロットカード画像`}
                cardName={card.name}
              />
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {card.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-knd-purple/30 px-3 py-1 text-[11px] text-knd-lavender border border-knd-lavender/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-8 text-[13.5px] leading-[1.9] text-knd-lavender/80">
          {/* 意味 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              このカードの意味
            </h2>
            <p className="whitespace-pre-line">{card.meaning}</p>
          </section>

          {/* 正位置 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">▲</span>
              正位置の意味
            </h2>
            <div className="space-y-4">
              <div className="bg-knd-indigo/60 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">全般</p>
                <p className="whitespace-pre-line">{card.upright.general}</p>
              </div>
              <div className="bg-knd-indigo/60 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">恋愛</p>
                <p className="whitespace-pre-line">{card.upright.love}</p>
              </div>
              <div className="bg-knd-indigo/60 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">仕事</p>
                <p className="whitespace-pre-line">{card.upright.work}</p>
              </div>
              <div className="bg-knd-indigo/60 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">金運</p>
                <p className="whitespace-pre-line">{card.upright.money}</p>
              </div>
            </div>
          </section>

          {/* 逆位置 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">▼</span>
              逆位置の意味
            </h2>
            <div className="space-y-4">
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">全般</p>
                <p className="whitespace-pre-line">{card.reversed.general}</p>
              </div>
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">恋愛</p>
                <p className="whitespace-pre-line">{card.reversed.love}</p>
              </div>
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-4">
                <p className="text-[11px] text-knd-gold/70 tracking-wider mb-2">仕事</p>
                <p className="whitespace-pre-line">{card.reversed.work}</p>
              </div>
            </div>
          </section>

          {/* アドバイス */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              このカードのアドバイス
            </h2>
            <div className="bg-knd-indigo-light/40 rounded-2xl p-5 border border-knd-purple/20">
              <p className="whitespace-pre-line">{card.advice}</p>
            </div>
          </section>

          {/* ノアからのメッセージ */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              ノアからのメッセージ
            </h2>
            <div className="bg-gradient-to-br from-knd-purple/25 to-knd-indigo/60 border border-knd-gold/25 rounded-2xl p-5">
              <p className="text-[13.5px] leading-[1.9] text-knd-lavender/90 whitespace-pre-line">
                {card.noaMessage}
              </p>
            </div>
          </section>

          {/* Prev / Next nav */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <div className="grid grid-cols-2 gap-3">
              {prev ? (
                <Link
                  href={`/tarot/cards/${prev.slug}`}
                  className="bg-knd-purple/20 border border-knd-lavender/15 rounded-xl p-3 transition-colors hover:border-knd-gold/30"
                >
                  <p className="text-[10px] text-knd-lavender/50 mb-1">← 前のカード</p>
                  <p className="text-[13px] text-knd-gold font-bold truncate">
                    {prev.number}. {prev.name}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/tarot/cards/${next.slug}`}
                  className="bg-knd-purple/20 border border-knd-lavender/15 rounded-xl p-3 text-right transition-colors hover:border-knd-gold/30"
                >
                  <p className="text-[10px] text-knd-lavender/50 mb-1">次のカード →</p>
                  <p className="text-[13px] text-knd-gold font-bold truncate">
                    {next.number}. {next.name}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/tarot/cards"
                className="inline-block text-[12px] text-knd-lavender/60 hover:text-knd-lavender transition-colors underline underline-offset-4"
              >
                大アルカナ一覧に戻る
              </Link>
            </div>
            <div className="mt-2 text-center">
              <Link
                href="/tarot"
                className="inline-block text-[12px] text-knd-lavender/50 hover:text-knd-lavender transition-colors"
              >
                タロット占いトップへ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
