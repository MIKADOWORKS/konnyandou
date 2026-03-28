'use client';

import { useState, useEffect, useCallback } from 'react';
import { majorArcana } from '@/lib/tarot-data';
import { TarotCard as TarotCardType } from '@/types/tarot';
import { buildTarotShareText } from '@/lib/share';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import NoaAvatar from '@/components/NoaAvatar';
import ShareButtons from '@/components/ShareButtons';

type Phase = 'ready' | 'shuffling' | 'pick' | 'reveal' | 'loading' | 'result';

interface CardPosition {
  x: number;
  rotation: number;
}

export default function TarotPage() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [reading, setReading] = useState('');
  const [question, setQuestion] = useState('');
  const [cardPositions, setCardPositions] = useState<CardPosition[]>(
    Array.from({ length: 7 }, (_, i) => ({
      x: (i - 3) * 38,
      rotation: (i - 3) * 4,
    }))
  );

  const handleShuffle = useCallback(() => {
    setPhase('shuffling');
    setSelectedCard(null);
    setReading('');

    const shuffleInterval = setInterval(() => {
      setCardPositions((prev) =>
        prev.map(() => ({
          x: (Math.random() - 0.5) * 160,
          rotation: (Math.random() - 0.5) * 30,
        }))
      );
    }, 200);

    setTimeout(() => {
      clearInterval(shuffleInterval);
      setCardPositions(
        Array.from({ length: 7 }, (_, i) => ({
          x: (i - 3) * 42,
          rotation: (i - 3) * 5,
        }))
      );
      setPhase('pick');
    }, 1500);
  }, []);

  const handlePick = useCallback(
    async (index: number) => {
      if (phase !== 'pick') return;

      const card = majorArcana[Math.floor(Math.random() * majorArcana.length)];
      const reversed = Math.random() > 0.6;
      setSelectedCard(card);
      setIsReversed(reversed);
      setPhase('reveal');

      // Wait for reveal animation then fetch reading
      await new Promise((r) => setTimeout(r, 1200));
      setPhase('loading');

      try {
        const res = await fetch('/api/tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            card,
            question: question || '今日の運勢を教えて',
            isReversed: reversed,
          }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setReading(data.reading);
      } catch {
        setReading(
          'こんにゃん出ましたけど〜！ごめんね、ちょっとツキの電波が不安定みたい…🐱 もう一回試してみて！…ってことで、こんなんどう？'
        );
      }
      setPhase('result');
    },
    [phase, question]
  );

  const reset = useCallback(() => {
    setPhase('ready');
    setSelectedCard(null);
    setIsReversed(false);
    setReading('');
    setCardPositions(
      Array.from({ length: 7 }, (_, i) => ({
        x: (i - 3) * 38,
        rotation: (i - 3) * 4,
      }))
    );
  }, []);

  return (
    <div className="relative pb-24">
      <StarField />
      <ConstellationDecor className="top-20 -right-8 w-[180px]" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="text-center pt-12 mb-8">
          <div className="text-[11px] text-knd-lavender/50 tracking-[4px] mb-2">
            TAROT READING
          </div>
          <h1 className="text-[22px] font-light font-display text-knd-lavender tracking-[2px]">
            今日の一枚引き
          </h1>
        </div>

        {/* Question input (ready phase) */}
        {phase === 'ready' && (
          <div className="mb-6 animate-fadeSlideIn">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="聞きたいことを入力（空欄でもOK）"
              className="w-full px-4 py-3 rounded-xl bg-knd-purple/30 border border-knd-lavender/15 text-[#d8d0e8] text-[13.5px] font-body focus:outline-none focus:border-knd-lavender/40"
            />
          </div>
        )}

        {/* Card spread area */}
        <div className="relative h-[220px] flex justify-center items-center mb-6">
          {phase === 'ready' && (
            <div className="w-[120px] h-[180px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-2 border-knd-gold/30 rounded-[10px] flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(100,60,200,0.3)] animate-float">
              <span className="text-[28px] text-knd-gold mb-1.5">☽</span>
              <span className="text-[8px] text-knd-lavender/40 tracking-[2px]">
                NOA&apos;S DECK
              </span>
            </div>
          )}

          {(phase === 'shuffling' || phase === 'pick') &&
            cardPositions.map((pos, i) => (
              <div
                key={i}
                onClick={() => handlePick(i)}
                className="absolute w-[90px] h-[135px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 rounded-lg flex items-center justify-center shadow-[0_4px_16px_rgba(60,30,120,0.5)]"
                style={{
                  transform: `translateX(${pos.x}px) rotate(${pos.rotation}deg)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: phase === 'pick' ? 'pointer' : 'default',
                  zIndex: i,
                }}
              >
                <span className="text-[18px] text-knd-gold/40">☽</span>
              </div>
            ))}

          {(phase === 'reveal' || phase === 'loading' || phase === 'result') &&
            selectedCard && (
              <div
                className="w-[140px] h-[210px] bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] border-2 border-knd-gold/50 rounded-xl flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(240,208,96,0.15),0_12px_40px_rgba(60,30,120,0.5)] animate-cardReveal"
                style={{
                  transform: isReversed ? 'rotate(180deg)' : 'none',
                }}
              >
                <div className="text-[10px] text-knd-gold/60 tracking-[2px]">
                  {String(selectedCard.id).padStart(1, '0')}
                </div>
                <div className="w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle,rgba(240,208,96,0.15),transparent)] flex items-center justify-center text-[30px]">
                  {selectedCard.emoji}
                </div>
                <div className="text-base text-knd-gold font-display font-medium">
                  {selectedCard.name}
                </div>
                <div className="text-[9px] text-knd-lavender/50 tracking-[1.5px]">
                  {selectedCard.nameEn}
                </div>
              </div>
            )}
        </div>

        {/* Actions per phase */}
        {phase === 'ready' && (
          <div className="text-center animate-fadeSlideIn">
            <button
              onClick={handleShuffle}
              className="px-10 py-3.5 bg-gradient-to-br from-knd-gold/20 to-knd-purple/20 border border-knd-gold/40 rounded-full text-knd-gold text-sm font-body tracking-[2px] transition-all hover:scale-105"
            >
              ✦ カードをシャッフル
            </button>
          </div>
        )}

        {phase === 'pick' && (
          <div className="text-center text-knd-lavender/60 text-[13px] font-body animate-pulse-slow">
            気になるカードをタップしてね
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 animate-fadeSlideIn">
            <div className="flex gap-1.5">
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
            <div className="text-knd-lavender/60 text-xs font-body">
              ツキに聞いてるよ…
            </div>
          </div>
        )}

        {phase === 'result' && selectedCard && (
          <div className="animate-fadeSlideIn">
            {/* Position badge */}
            <div className="text-center mb-4">
              <span
                className="inline-block px-3.5 py-1 rounded-full text-[11px] font-body border"
                style={{
                  background: isReversed
                    ? 'rgba(180, 100, 200, 0.2)'
                    : 'rgba(240, 208, 96, 0.15)',
                  borderColor: isReversed
                    ? 'rgba(180, 100, 200, 0.3)'
                    : 'rgba(240, 208, 96, 0.3)',
                  color: isReversed ? '#c8a0e0' : '#f0d060',
                }}
              >
                {isReversed ? '逆位置' : '正位置'}
              </span>
            </div>

            {/* Noa's reading */}
            <div className="flex gap-3 items-start bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-4">
              <NoaAvatar size={40} borderColor="rgba(240, 208, 96, 0.3)" />
              <div>
                <div className="text-[11px] text-knd-gold font-body mb-1.5">
                  ノアの解釈
                </div>
                <div className="text-[13.5px] leading-[1.8] text-[#d8d0e8] font-body">
                  {reading}
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-4">
              <ShareButtons
                text={buildTarotShareText(
                  selectedCard.name,
                  selectedCard.nameEn,
                  isReversed,
                  reading
                )}
                url="https://konnyandou-buc7.vercel.app/tarot"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-3">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-knd-purple/30 border border-knd-lavender/15 rounded-[10px] text-knd-lavender text-[12.5px] font-body"
              >
                もう一度引く
              </button>
              <button
                disabled
                className="flex-1 py-3 bg-knd-gold/10 border border-knd-gold/20 rounded-[10px] text-knd-gold/40 text-[12.5px] font-body cursor-not-allowed"
              >
                ✦ 3枚スプレッド
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
