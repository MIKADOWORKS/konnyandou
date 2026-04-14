'use client';

import { useState } from 'react';
import Link from 'next/link';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import SingleDraw from '@/components/tarot/SingleDraw';
import ThreeCardSpread from '@/components/tarot/ThreeCardSpread';

type Mode = 'select' | 'single' | 'spread';

export default function TarotPageClient() {
  const [mode, setMode] = useState<Mode>('select');

  return (
    <div className="relative pb-24">
      <StarField />
      <ConstellationDecor className="top-20 -right-8 w-[180px]" />

      <div className="relative z-10 px-5">
        <div className="text-center pt-12 mb-8">
          <div className="text-[11px] text-knd-lavender/50 tracking-[4px] mb-2">TAROT READING</div>
          <h1 className="text-[22px] font-light font-display text-knd-lavender tracking-[2px]">
            {mode === 'spread' ? '3枚スプレッド' : mode === 'single' ? '今日の一枚引き' : 'タロット占い'}
          </h1>
        </div>

        {mode === 'select' && (
          <div className="space-y-4 animate-fadeSlideIn">
            <button
              onClick={() => setMode('single')}
              className="w-full p-5 bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl text-left transition-all hover:border-knd-gold/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{'\u2726'}</span>
                <div className="text-base text-knd-gold font-display font-medium">一枚引き</div>
              </div>
              <div className="text-[12.5px] text-knd-lavender/60 font-body leading-relaxed">
                シンプルに1枚のカードからメッセージを受け取ろう。今日の運勢や気になることに。
              </div>
            </button>

            <button
              onClick={() => setMode('spread')}
              className="w-full p-5 bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl text-left transition-all hover:border-knd-gold/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{'\u2726\u2726\u2726'}</span>
                <div className="text-base text-knd-gold font-display font-medium">3枚スプレッド</div>
              </div>
              <div className="text-[12.5px] text-knd-lavender/60 font-body leading-relaxed">
                過去・現在・未来の3枚で、流れを読み解こう。じっくり占いたい時におすすめ。
              </div>
            </button>
          </div>
        )}

        {mode === 'single' && <SingleDraw />}
        {mode === 'spread' && <ThreeCardSpread />}

        {mode !== 'select' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode('select')}
              className="text-knd-lavender/40 text-[11px] font-body underline underline-offset-4"
            >
              占い方を選びなおす
            </button>
          </div>
        )}

        {/* Card encyclopedia link */}
        <div className="mt-8">
          <div className="border-t border-knd-lavender/15 my-4" />
          <Link
            href="/tarot/cards"
            className="block bg-knd-indigo/60 border border-knd-lavender/15 rounded-2xl p-4 transition-colors hover:border-knd-gold/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl text-knd-gold/80">{'\u2726'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] text-knd-lavender font-bold mb-0.5">
                  大アルカナ22枚の解説を見る
                </p>
                <p className="text-[11px] text-knd-lavender/55">
                  愚者から世界まで、カードの意味を一覧で
                </p>
              </div>
              <span className="text-knd-lavender/40 text-base shrink-0">›</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
