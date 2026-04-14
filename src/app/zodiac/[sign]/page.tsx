import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ZODIAC } from '@/lib/zodiac-data';
import { ZODIAC_RICH } from '@/lib/zodiac-rich-data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const ELEMENT_COLORS: Record<string, string> = {
  火: 'text-red-400',
  地: 'text-amber-400',
  風: 'text-cyan-400',
  水: 'text-blue-400',
};

interface Props {
  params: Promise<{ sign: string }>;
}

export async function generateStaticParams() {
  return ZODIAC.map((z) => ({ sign: z.en.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sign: signParam } = await params;
  const zodiac = ZODIAC.find((z) => z.en.toLowerCase() === signParam);
  if (!zodiac) return {};

  const rich = ZODIAC_RICH[signParam] ?? null;
  const title = `${zodiac.sign} 今日の運勢・性格・占い | ${SITE_NAME}`;
  const description = rich
    ? `${zodiac.sign}（${zodiac.dates}）の性格・恋愛・仕事・金運・相性をAI占い師ノアが解説。${rich.overview.slice(0, 90)}`
    : `${zodiac.sign}（${zodiac.dates}）の今日の運勢、性格、相性をAI占い師ノアが鑑定。${zodiac.description.slice(0, 40)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/zodiac/${signParam}`,
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ZodiacSignPage({ params }: Props) {
  const { sign: signParam } = await params;
  const zodiac = ZODIAC.find((z) => z.en.toLowerCase() === signParam);
  if (!zodiac) notFound();

  const rich = ZODIAC_RICH[signParam] ?? null;

  return (
    <main className="min-h-screen px-5 pt-10 pb-28">
      {/* Header */}
      <div className="text-center mb-6 animate-fadeSlideIn">
        <p className="text-5xl mb-2">{zodiac.icon}</p>
        <h1 className="text-2xl font-bold text-knd-lavender">
          {zodiac.sign}
          <span className="text-knd-lavender/50 text-base ml-2">
            {zodiac.en}
          </span>
        </h1>
        <p className="text-knd-gold text-sm mt-1">{zodiac.dates}</p>
      </div>

      {/* Element & Ruling */}
      <div
        className="animate-fadeSlideIn"
        style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
      >
        <div className="border-t border-knd-lavender/20 my-4" />
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-knd-lavender/60">四元素</span>
            <span className={`font-bold ${ELEMENT_COLORS[zodiac.element] ?? 'text-knd-lavender'}`}>
              {zodiac.element}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-knd-lavender/60">守護星</span>
            <span className="font-bold text-knd-gold">{zodiac.ruling}</span>
          </div>
        </div>
      </div>

      {/* Traits */}
      <div
        className="flex flex-wrap justify-center gap-2 mt-4 animate-fadeSlideIn"
        style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
      >
        {zodiac.traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full bg-knd-purple/30 px-3 py-1 text-xs text-knd-lavender border border-knd-lavender/20"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Description */}
      <div
        className="mt-6 animate-fadeSlideIn"
        style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
      >
        <p className="text-sm leading-relaxed text-knd-lavender/80">
          {zodiac.description}
        </p>
      </div>

      {/* CTA: Today's fortune */}
      <div
        className="mt-6 animate-fadeSlideIn"
        style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
      >
        <div className="border-t border-knd-lavender/20 my-4" />
        <Link
          href="/"
          className="block w-full text-center bg-knd-purple/40 hover:bg-knd-purple/60 transition-colors rounded-xl py-3 text-knd-gold font-bold text-sm border border-knd-gold/30"
        >
          今日の運勢を見る
        </Link>
      </div>

      {/* Tsuki message */}
      <div
        className="mt-6 animate-fadeSlideIn"
        style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
      >
        <div className="border-t border-knd-lavender/20 my-4" />
        <div className="bg-knd-indigo/60 rounded-xl p-4 border border-knd-lavender/10">
          <p className="text-sm text-knd-lavender/70 mb-2">
            <span className="mr-1">🐱</span>ツキからのひとこと
          </p>
          <p className="text-sm text-knd-lavender/90 leading-relaxed">
            「あなたの星の力をもっと知りたい？ ノアに相談してみてにゃ」
          </p>
          <Link
            href="/chat"
            className="inline-block mt-3 text-xs text-knd-gold hover:text-knd-gold/80 transition-colors underline underline-offset-2"
          >
            ノアに相談する →
          </Link>
        </div>
      </div>

      {/* X follow */}
      <div
        className="mt-6 text-center animate-fadeSlideIn"
        style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
      >
        <div className="border-t border-knd-lavender/20 my-4" />
        <p className="text-xs text-knd-lavender/50 mb-2">
          @konnyandou をフォローして毎朝の運勢をチェック
        </p>
        <a
          href="https://x.com/konnyandou"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-knd-lavender/70 hover:text-knd-lavender transition-colors"
        >
          𝕏 フォローする
        </a>
      </div>

      {/* Rich details (from ZODIAC_RICH) */}
      {rich && (
        <>
          {/* 基本性格 */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              基本性格
            </h2>
            <p className="text-[13.5px] leading-[1.9] text-knd-lavender/80 whitespace-pre-line">
              {rich.overview}
            </p>
          </section>

          {/* 恋愛傾向 */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              恋愛傾向
            </h2>
            <p className="text-[13.5px] leading-[1.9] text-knd-lavender/80 whitespace-pre-line">
              {rich.love}
            </p>
          </section>

          {/* 仕事・キャリア */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              仕事・キャリア
            </h2>
            <p className="text-[13.5px] leading-[1.9] text-knd-lavender/80 whitespace-pre-line">
              {rich.work}
            </p>
          </section>

          {/* 金運 */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '1.0s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              金運
            </h2>
            <p className="text-[13.5px] leading-[1.9] text-knd-lavender/80 whitespace-pre-line">
              {rich.money}
            </p>
          </section>

          {/* 相性 */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '1.1s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              相性
            </h2>
            <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-4 mb-3">
              <p className="text-[11px] text-knd-lavender/50 mb-2 tracking-wider">相性の良い星座</p>
              <div className="flex flex-wrap gap-2">
                {rich.compatibility.best.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-knd-gold/15 border border-knd-gold/30 px-3 py-1 text-xs text-knd-gold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-knd-indigo/60 border border-knd-lavender/10 rounded-2xl p-4 mb-3">
              <p className="text-[11px] text-knd-lavender/50 mb-2 tracking-wider">注意が必要な星座</p>
              <div className="flex flex-wrap gap-2">
                {rich.compatibility.challenging.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-knd-purple/30 border border-knd-lavender/20 px-3 py-1 text-xs text-knd-lavender/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[13px] leading-[1.9] text-knd-lavender/75 whitespace-pre-line">
              {rich.compatibility.note}
            </p>
          </section>

          {/* ラッキーアイテム */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              ラッキーアイテム
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-xl p-3">
                <p className="text-[10px] text-knd-lavender/50 tracking-wider mb-1">カラー</p>
                <p className="text-[13px] text-knd-gold font-bold">{rich.lucky.color}</p>
              </div>
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-xl p-3">
                <p className="text-[10px] text-knd-lavender/50 tracking-wider mb-1">ナンバー</p>
                <p className="text-[13px] text-knd-gold font-bold">{rich.lucky.number}</p>
              </div>
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-xl p-3">
                <p className="text-[10px] text-knd-lavender/50 tracking-wider mb-1">アイテム</p>
                <p className="text-[13px] text-knd-gold font-bold">{rich.lucky.item}</p>
              </div>
              <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-xl p-3">
                <p className="text-[10px] text-knd-lavender/50 tracking-wider mb-1">曜日</p>
                <p className="text-[13px] text-knd-gold font-bold">{rich.lucky.day}</p>
              </div>
            </div>
          </section>

          {/* 有名人 */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '1.3s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              この星座で活躍した人
            </h2>
            <div className="flex flex-wrap gap-2">
              {rich.famous.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-knd-indigo/60 border border-knd-lavender/15 px-3 py-1 text-xs text-knd-lavender/80"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>

          {/* ノアからのひとこと */}
          <section
            className="mt-8 animate-fadeSlideIn"
            style={{ animationDelay: '1.4s', animationFillMode: 'backwards' }}
          >
            <div className="border-t border-knd-lavender/20 my-4" />
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              ノアからのひとこと
            </h2>
            <div className="bg-gradient-to-br from-knd-purple/25 to-knd-indigo/60 border border-knd-gold/25 rounded-2xl p-5">
              <p className="text-[13.5px] leading-[1.9] text-knd-lavender/90 whitespace-pre-line">
                {rich.noaComment}
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
