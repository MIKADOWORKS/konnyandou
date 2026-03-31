'use client';

import { useState, useCallback } from 'react';
import { TarotCard as TarotCardType } from '@/types/tarot';
import { buildTarotShareText, buildTarotShareUrl } from '@/lib/share';
import { saveToHistory } from '@/lib/history';
import ShareButtons from '@/components/ShareButtons';
import RevealedCard from './RevealedCard';
import PositionBadge from './PositionBadge';
import ReadingBubble from './ReadingBubble';
import LoadingIndicator from './LoadingIndicator';
import { CardPosition, drawRandomCard } from './utils';

type SinglePhase = 'ready' | 'shuffling' | 'pick' | 'reveal' | 'loading' | 'result';

export default function SingleDraw() {
  const [phase, setPhase] = useState<SinglePhase>('ready');
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [reading, setReading] = useState('');
  const [question, setQuestion] = useState('');
  const [cardPositions, setCardPositions] = useState<CardPosition[]>(
    Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 38, rotation: (i - 3) * 4 }))
  );

  const handleShuffle = useCallback(() => {
    setPhase('shuffling');
    setSelectedCard(null);
    setReading('');
    const shuffleInterval = setInterval(() => {
      setCardPositions(
        Array.from({ length: 7 }, () => ({
          x: (Math.random() - 0.5) * 160,
          rotation: (Math.random() - 0.5) * 30,
        }))
      );
    }, 200);
    setTimeout(() => {
      clearInterval(shuffleInterval);
      setCardPositions(
        Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 42, rotation: (i - 3) * 5 }))
      );
      setPhase('pick');
    }, 1500);
  }, []);

  const handlePick = useCallback(
    async () => {
      if (phase !== 'pick') return;
      const { card, isReversed: reversed } = drawRandomCard([]);
      setSelectedCard(card);
      setIsReversed(reversed);
      setPhase('reveal');
      await new Promise((r) => setTimeout(r, 1200));
      setPhase('loading');
      let readingText = '';
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
        readingText = data.reading;
        setReading(readingText);
      } catch {
        readingText =
          'こんにゃん出ましたけど〜！ごめんね、ちょっとツキの電波が不安定みたい...\u{1F431} もう一回試してみて！...ってことで、こんなんどう？';
        setReading(readingText);
      }
      setPhase('result');
      saveToHistory({
        type: 'tarot-single',
        reading: readingText,
        cardName: card.name,
        cardNameEn: card.nameEn,
        cardEmoji: card.emoji,
        isReversed: reversed,
        question: question || undefined,
      });
    },
    [phase, question]
  );

  const reset = useCallback(() => {
    setPhase('ready');
    setSelectedCard(null);
    setIsReversed(false);
    setReading('');
    setCardPositions(
      Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 38, rotation: (i - 3) * 4 }))
    );
  }, []);

  return (
    <>
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

      {/* Card area */}
      <div className="relative h-[220px] flex justify-center items-center mb-6">
        {phase === 'ready' && (
          <div className="w-[120px] h-[180px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-2 border-knd-gold/30 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(100,60,200,0.3)] animate-float">
            <span className="text-[28px] text-knd-gold mb-1.5">{'\u263D'}</span>
            <span className="text-[8px] text-knd-lavender/40 tracking-[2px]">NOA&apos;S DECK</span>
          </div>
        )}

        {(phase === 'shuffling' || phase === 'pick') &&
          cardPositions.map((pos, i) => (
            <div
              key={i}
              onClick={() => handlePick()}
              className="absolute w-[90px] h-[135px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 flex items-center justify-center shadow-[0_4px_16px_rgba(60,30,120,0.5)]"
              style={{
                transform: `translateX(${pos.x}px) rotate(${pos.rotation}deg)`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: phase === 'pick' ? 'pointer' : 'default',
                zIndex: i,
              }}
            >
              <span className="text-[18px] text-knd-gold/40">{'\u263D'}</span>
            </div>
          ))}

        {(phase === 'reveal' || phase === 'loading' || phase === 'result') && selectedCard && (
          <RevealedCard card={selectedCard} isReversed={isReversed} />
        )}
      </div>

      {phase === 'ready' && (
        <div className="text-center animate-fadeSlideIn">
          <button
            onClick={handleShuffle}
            className="px-10 py-3.5 bg-gradient-to-br from-knd-gold/20 to-knd-purple/20 border border-knd-gold/40 rounded-full text-knd-gold text-sm font-body tracking-[2px] transition-all hover:scale-105"
          >
            {'\u2726'} カードをシャッフル
          </button>
        </div>
      )}

      {phase === 'pick' && (
        <div className="text-center text-knd-lavender/60 text-[13px] font-body animate-pulse-slow">
          気になるカードをタップしてね
        </div>
      )}

      {phase === 'loading' && <LoadingIndicator />}

      {phase === 'result' && selectedCard && (
        <div className="animate-fadeSlideIn">
          <PositionBadge isReversed={isReversed} />
          <ReadingBubble reading={reading} />
          <div className="mt-4">
            <ShareButtons
              text={buildTarotShareText(selectedCard.name, selectedCard.nameEn, isReversed, reading)}
              url={buildTarotShareUrl(selectedCard.name, selectedCard.nameEn, selectedCard.emoji, isReversed)}
            />
          </div>
          <div className="flex gap-2.5 mt-3">
            <button
              onClick={reset}
              className="flex-1 py-3 bg-knd-purple/30 border border-knd-lavender/15 rounded-[10px] text-knd-lavender text-[12.5px] font-body"
            >
              もう一度引く
            </button>
          </div>
        </div>
      )}
    </>
  );
}
