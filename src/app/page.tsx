'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ZODIAC, ZodiacSign } from '@/lib/zodiac-data';
import { buildZodiacShareText, buildZodiacShareUrl } from '@/lib/share';
import { SITE_URL } from '@/lib/constants';
import { saveToHistory } from '@/lib/history';
import Image from 'next/image';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import NoaAvatar from '@/components/NoaAvatar';
import ShareButtons from '@/components/ShareButtons';

export default function HomePage() {
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacSign | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [showReading, setShowReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ label: string; stars: number }[]>([]);
  const [overallStars, setOverallStars] = useState(0);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayStr = days[today.getDay()];

  const handleSelect = async (z: ZodiacSign) => {
    setSelectedZodiac(z);
    setShowReading(false);
    setIsLoading(true);

    let readingText = '';
    let overall = 4;
    let cats = [
      { label: '恋愛運', stars: 4 },
      { label: '仕事運', stars: 3 },
      { label: '金運', stars: 5 },
    ];

    try {
      const res = await fetch('/api/zodiac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign: z.sign, signEn: z.en }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      readingText = data.reading;
      overall = data.overall;
      cats = data.categories;
      setReading(readingText);
      setOverallStars(overall);
      setCategories(cats);
    } catch {
      readingText =
        '今日は直感がさえてる日！ふと思いついたことをメモしておくと、あとで役立つかも。午後からは人との会話にヒントが隠れてるよ。';
      setReading(readingText);
      setOverallStars(overall);
      setCategories(cats);
    } finally {
      setIsLoading(false);
      setShowReading(true);
      saveToHistory({
        type: 'zodiac',
        reading: readingText,
        sign: z.sign,
        signIcon: z.icon,
        overall,
        categories: cats,
      });
    }
  };

  return (
    <div className="relative pb-24">
      <StarField />
      <ConstellationDecor className="top-20 -right-8 w-[180px]" />
      <ConstellationDecor className="top-[400px] -left-10 w-[160px] rotate-45" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="text-center pt-8 mb-8 animate-fadeSlideIn">
          <div className="mb-4">
            <Image
              src="/images/logo.png"
              alt="こんにゃん堂"
              width={430}
              height={241}
              className="w-full rounded-xl"
              priority
            />
          </div>
          <div className="text-[11px] text-knd-lavender/60 tracking-[4px] mb-2">
            {dateStr}（{dayStr}）
          </div>
          <h1 className="text-[28px] font-light font-display bg-gradient-to-br from-knd-lavender to-knd-gold bg-clip-text text-transparent tracking-[3px]">
            ノアの星よみ
          </h1>
          <div className="text-[11px] text-knd-lavender/40 tracking-[6px] mt-1.5">
            NOA&apos;S STAR READING
          </div>
        </div>

        {/* Noa greeting */}
        <div className="flex gap-3 items-start mb-7 animate-fadeSlideIn" style={{ animationDelay: '0.2s' }}>
          <NoaAvatar size={64} />
          <div className="bg-knd-purple/40 border border-knd-lavender/15 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl px-4 py-3 text-[13.5px] leading-[1.7] text-[#d8d0e8] font-body">
            やっほー！今日はどの星座の運勢が気になる？ 下から選んでみて✨
          </div>
        </div>

        {/* Zodiac grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {ZODIAC.map((z, i) => (
            <button
              key={z.en}
              onClick={() => handleSelect(z)}
              className="flex flex-col items-center gap-1 py-3.5 px-1 rounded-xl border transition-all animate-fadeSlideIn"
              style={{
                animationDelay: `${0.3 + i * 0.05}s`,
                animationFillMode: 'backwards',
                background:
                  selectedZodiac?.en === z.en
                    ? 'linear-gradient(135deg, rgba(240, 208, 96, 0.25), rgba(180, 120, 255, 0.2))'
                    : 'rgba(40, 25, 80, 0.5)',
                borderColor:
                  selectedZodiac?.en === z.en
                    ? 'rgba(240, 208, 96, 0.4)'
                    : 'rgba(180, 150, 255, 0.1)',
              }}
            >
              <span className="text-[22px]">{z.icon}</span>
              <span
                className="text-[10.5px] font-body"
                style={{
                  color: selectedZodiac?.en === z.en ? '#f0d060' : '#b8a8d8',
                }}
              >
                {z.sign}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && selectedZodiac && (
          <div className="bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-5 animate-fadeSlideIn">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[26px]">{selectedZodiac.icon}</span>
              <div className="font-body text-knd-gold text-base font-medium">
                {selectedZodiac.sign}を占い中...
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <NoaAvatar size={36} borderColor="rgba(240, 208, 96, 0.3)" />
              <div className="flex gap-1.5 items-center pt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-knd-lavender"
                    style={{
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reading result */}
        {showReading && selectedZodiac && reading && (
          <div className="bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-5 mb-4 animate-fadeSlideIn">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-[26px]">{selectedZodiac.icon}</span>
              <div>
                <div className="text-base text-knd-gold font-body font-medium">
                  {selectedZodiac.sign}の今日の運勢
                </div>
                <div className="text-[10px] text-knd-lavender/50 tracking-[2px]">
                  {selectedZodiac.en} — {dateStr}
                </div>
              </div>
            </div>

            {/* Stars rating */}
            <div className="flex gap-1 mb-3.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-base"
                  style={{
                    color: i < overallStars ? '#f0d060' : 'rgba(200, 180, 255, 0.2)',
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Noa's reading */}
            <div className="flex gap-3 items-start">
              <NoaAvatar size={36} borderColor="rgba(240, 208, 96, 0.3)" />
              <div className="text-[13.5px] leading-[1.8] text-[#d8d0e8] font-body">
                {reading}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4.5 pt-4 border-t border-knd-lavender/10">
              {categories.map((cat) => (
                <div key={cat.label} className="text-center">
                  <div className="text-[10.5px] text-knd-lavender/60 mb-1 font-body">
                    {cat.label}
                  </div>
                  <div className="flex justify-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-[10px]"
                        style={{
                          color: i < cat.stars ? '#f0d060' : 'rgba(200, 180, 255, 0.15)',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Share buttons */}
            <div className="mt-4 pt-4 border-t border-knd-lavender/10">
              <ShareButtons
                text={buildZodiacShareText(selectedZodiac.sign, overallStars, reading)}
                url={buildZodiacShareUrl(selectedZodiac.sign, selectedZodiac.icon, overallStars)}
              />
            </div>
          </div>
        )}

        {/* History link */}
        <div className="mt-6 text-center animate-fadeSlideIn" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-[12px] text-knd-lavender/40 font-body hover:text-knd-lavender/60 transition-colors"
          >
            <span>📜</span>
            <span>鑑定履歴を見る</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
