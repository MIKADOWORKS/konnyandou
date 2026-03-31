'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { saveToHistory } from '@/lib/history';
import ShareButtons from '@/components/ShareButtons';
import { buildSpreadShareUrl } from '@/lib/share';
import ReadingBubble from './ReadingBubble';
import LoadingIndicator from './LoadingIndicator';
import { CardPosition, DrawnCard, SPREAD_POSITIONS, drawRandomCard } from './utils';

type SpreadPhase = 'ready' | 'shuffling' | 'pick' | 'revealing' | 'loading' | 'result';

export default function ThreeCardSpread() {
  const [phase, setPhase] = useState<SpreadPhase>('ready');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [reading, setReading] = useState('');
  const [question, setQuestion] = useState('');
  const [cardPositions, setCardPositions] = useState<CardPosition[]>(
    Array.from({ length: 9 }, (_, i) => ({ x: (i - 4) * 32, rotation: (i - 4) * 3 }))
  );

  const handleShuffle = useCallback(() => {
    setPhase('shuffling');
    setDrawnCards([]);
    setRevealedCount(0);
    setReading('');

    const shuffleInterval = setInterval(() => {
      setCardPositions(
        Array.from({ length: 9 }, () => ({
          x: (Math.random() - 0.5) * 200,
          rotation: (Math.random() - 0.5) * 40,
        }))
      );
    }, 200);

    setTimeout(() => {
      clearInterval(shuffleInterval);
      setCardPositions(
        Array.from({ length: 9 }, (_, i) => ({ x: (i - 4) * 36, rotation: (i - 4) * 4 }))
      );
      setPhase('pick');
    }, 1500);
  }, []);

  const handlePick = useCallback(() => {
    if (phase !== 'pick') return;
    if (drawnCards.length >= 3) return;

    const excluded = drawnCards.map((d) => d.card);
    const { card, isReversed } = drawRandomCard(excluded);
    const position = SPREAD_POSITIONS[drawnCards.length];
    const newDrawn = [...drawnCards, { card, isReversed, position }];
    setDrawnCards(newDrawn);

    if (newDrawn.length >= 3) {
      setPhase('revealing');
      let count = 0;
      const revealInterval = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= 3) {
          clearInterval(revealInterval);
          setTimeout(() => fetchReading(newDrawn), 500);
        }
      }, 800);
    }
  }, [phase, drawnCards]);

  const fetchReading = async (cards: DrawnCard[]) => {
    setPhase('loading');
    let readingText = '';
    try {
      const res = await fetch('/api/tarot/spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: cards.map((d) => ({
            card: d.card,
            isReversed: d.isReversed,
            position: d.position,
          })),
          question: question || '今日の運勢を教えて',
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
    setRevealedCount(3);
    setPhase('result');
    saveToHistory({
      type: 'tarot-spread',
      reading: readingText,
      question: question || undefined,
      spreadCards: cards.map((d) => ({
        position: d.position,
        cardName: d.card.name,
        cardEmoji: d.card.emoji,
        isReversed: d.isReversed,
      })),
    });
  };

  const reset = useCallback(() => {
    setPhase('ready');
    setDrawnCards([]);
    setRevealedCount(0);
    setReading('');
    setCardPositions(
      Array.from({ length: 9 }, (_, i) => ({ x: (i - 4) * 32, rotation: (i - 4) * 3 }))
    );
  }, []);

  const shareText =
    drawnCards.length === 3
      ? `\u{1F52E} 3枚スプレッド\n過去: ${drawnCards[0].card.name}（${drawnCards[0].isReversed ? '逆' : '正'}）\n現在: ${drawnCards[1].card.name}（${drawnCards[1].isReversed ? '逆' : '正'}）\n未来: ${drawnCards[2].card.name}（${drawnCards[2].isReversed ? '逆' : '正'}）\n\n#こんにゃん堂 #タロット占い`
      : '';

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
      {(phase === 'ready' || phase === 'shuffling' || phase === 'pick') && (
        <div className="relative h-[220px] flex justify-center items-center mb-6">
          {phase === 'ready' && (
            <div className="w-[120px] h-[180px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-2 border-knd-gold/30 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(100,60,200,0.3)] animate-float">
              <span className="text-[28px] text-knd-gold mb-1.5">{'\u263D'}</span>
              <span className="text-[8px] text-knd-lavender/40 tracking-[2px]">3 CARDS</span>
            </div>
          )}

          {(phase === 'shuffling' || phase === 'pick') &&
            cardPositions.map((pos, i) => (
              <div
                key={i}
                onClick={() => handlePick()}
                className="absolute w-[80px] h-[120px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 flex items-center justify-center shadow-[0_4px_16px_rgba(60,30,120,0.5)]"
                style={{
                  transform: `translateX(${pos.x}px) rotate(${pos.rotation}deg)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: phase === 'pick' ? 'pointer' : 'default',
                  zIndex: i,
                }}
              >
                <span className="text-[14px] text-knd-gold/40">{'\u263D'}</span>
              </div>
            ))}
        </div>
      )}

      {/* Revealed 3 cards */}
      {(phase === 'revealing' || phase === 'loading' || phase === 'result') && (
        <div className="flex justify-center gap-3 mb-6">
          {drawnCards.map((d, i) => {
            const isVisible = i < revealedCount;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="text-[10px] text-knd-lavender/60 font-body tracking-wider">
                  {d.position}
                </div>
                {isVisible ? (
                  <div
                    className="w-[100px] h-[150px] border-[1.5px] border-knd-gold/50 shadow-[0_0_20px_rgba(240,208,96,0.1)] animate-cardReveal overflow-hidden relative"
                    style={{ transform: d.isReversed ? 'rotate(180deg)' : 'none' }}
                  >
                    {d.card.image ? (
                      <>
                        <Image
                          src={d.card.image}
                          alt={d.card.name}
                          width={100}
                          height={150}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-1 flex flex-col items-center gap-0.5">
                          <div className="text-[10px] text-knd-gold font-display font-medium">{d.card.name}</div>
                          <div className="text-[7px] text-knd-lavender/70 tracking-[1px]">{d.card.nameEn}</div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] flex flex-col items-center justify-center gap-1">
                        <div className="text-[24px]">{d.card.emoji}</div>
                        <div className="text-[11px] text-knd-gold font-display font-medium">{d.card.name}</div>
                        <div className="text-[7px] text-knd-lavender/50 tracking-[1px]">{d.card.nameEn}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[100px] h-[150px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 flex items-center justify-center">
                    <span className="text-[14px] text-knd-gold/40">{'\u263D'}</span>
                  </div>
                )}
                {isVisible && (
                  <span
                    className="text-[9px] font-body"
                    style={{ color: d.isReversed ? '#c8a0e0' : '#f0d060' }}
                  >
                    {d.isReversed ? '逆位置' : '正位置'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

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
        <div className="text-center space-y-1">
          <div className="text-knd-lavender/60 text-[13px] font-body animate-pulse-slow">
            カードをタップして3枚選んでね
          </div>
          <div className="text-knd-gold/60 text-[11px] font-body">
            {drawnCards.length} / 3 枚選択済み
          </div>
        </div>
      )}

      {phase === 'loading' && <LoadingIndicator />}

      {phase === 'result' && (
        <div className="animate-fadeSlideIn">
          <ReadingBubble reading={reading} />
          <div className="mt-4">
            <ShareButtons
              text={shareText}
              url={buildSpreadShareUrl(drawnCards.map((d) => ({ name: d.card.name, emoji: d.card.emoji, isReversed: d.isReversed })))}
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
