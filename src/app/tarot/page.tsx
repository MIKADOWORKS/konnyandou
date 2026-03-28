'use client';

import { useState, useCallback } from 'react';
import { majorArcana } from '@/lib/tarot-data';
import { TarotCard as TarotCardType } from '@/types/tarot';
import { buildTarotShareText } from '@/lib/share';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import NoaAvatar from '@/components/NoaAvatar';
import ShareButtons from '@/components/ShareButtons';

type Mode = 'select' | 'single' | 'spread';
type SinglePhase = 'ready' | 'shuffling' | 'pick' | 'reveal' | 'loading' | 'result';
type SpreadPhase = 'ready' | 'shuffling' | 'pick' | 'revealing' | 'loading' | 'result';

interface CardPosition {
  x: number;
  rotation: number;
}

interface DrawnCard {
  card: TarotCardType;
  isReversed: boolean;
  position: string;
}

const SPREAD_POSITIONS = ['過去', '現在', '未来'] as const;

function drawRandomCard(exclude: TarotCardType[]): { card: TarotCardType; isReversed: boolean } {
  const available = majorArcana.filter((c) => !exclude.some((e) => e.id === c.id));
  const card = available[Math.floor(Math.random() * available.length)];
  const isReversed = Math.random() > 0.6;
  return { card, isReversed };
}

// ─── Single Draw Component ───
function SingleDraw() {
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
          <div className="w-[120px] h-[180px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-2 border-knd-gold/30 rounded-[10px] flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(100,60,200,0.3)] animate-float">
            <span className="text-[28px] text-knd-gold mb-1.5">☽</span>
            <span className="text-[8px] text-knd-lavender/40 tracking-[2px]">NOA&apos;S DECK</span>
          </div>
        )}

        {(phase === 'shuffling' || phase === 'pick') &&
          cardPositions.map((pos, i) => (
            <div
              key={i}
              onClick={() => handlePick()}
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
            ✦ カードをシャッフル
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
              url="https://konnyandou-buc7.vercel.app/tarot"
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

// ─── Three Card Spread Component ───
function ThreeCardSpread() {
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
      // Reveal cards one by one
      let count = 0;
      const revealInterval = setInterval(() => {
        count++;
        setRevealedCount(count);
        if (count >= 3) {
          clearInterval(revealInterval);
          // Fetch reading after all revealed
          setTimeout(() => fetchReading(newDrawn), 500);
        }
      }, 800);
    }
  }, [phase, drawnCards]);

  const fetchReading = async (cards: DrawnCard[]) => {
    setPhase('loading');
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
      setReading(data.reading);
    } catch {
      setReading(
        'こんにゃん出ましたけど〜！ごめんね、ちょっとツキの電波が不安定みたい…🐱 もう一回試してみて！…ってことで、こんなんどう？'
      );
    }
    setRevealedCount(3);
    setPhase('result');
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
      ? `🔮 3枚スプレッド\n過去: ${drawnCards[0].card.name}（${drawnCards[0].isReversed ? '逆' : '正'}）\n現在: ${drawnCards[1].card.name}（${drawnCards[1].isReversed ? '逆' : '正'}）\n未来: ${drawnCards[2].card.name}（${drawnCards[2].isReversed ? '逆' : '正'}）\n\n#こんにゃん堂 #タロット占い`
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
            <div className="w-[120px] h-[180px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-2 border-knd-gold/30 rounded-[10px] flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(100,60,200,0.3)] animate-float">
              <span className="text-[28px] text-knd-gold mb-1.5">☽</span>
              <span className="text-[8px] text-knd-lavender/40 tracking-[2px]">3 CARDS</span>
            </div>
          )}

          {(phase === 'shuffling' || phase === 'pick') &&
            cardPositions.map((pos, i) => (
              <div
                key={i}
                onClick={() => handlePick()}
                className="absolute w-[80px] h-[120px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 rounded-lg flex items-center justify-center shadow-[0_4px_16px_rgba(60,30,120,0.5)]"
                style={{
                  transform: `translateX(${pos.x}px) rotate(${pos.rotation}deg)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  cursor: phase === 'pick' ? 'pointer' : 'default',
                  zIndex: i,
                }}
              >
                <span className="text-[14px] text-knd-gold/40">☽</span>
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
                    className="w-[100px] h-[150px] bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] border-[1.5px] border-knd-gold/50 rounded-lg flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(240,208,96,0.1)] animate-cardReveal"
                    style={{ transform: d.isReversed ? 'rotate(180deg)' : 'none' }}
                  >
                    <div className="text-[24px]">{d.card.emoji}</div>
                    <div className="text-[11px] text-knd-gold font-display font-medium">
                      {d.card.name}
                    </div>
                    <div className="text-[7px] text-knd-lavender/50 tracking-[1px]">
                      {d.card.nameEn}
                    </div>
                  </div>
                ) : (
                  <div className="w-[100px] h-[150px] bg-gradient-to-br from-[#2a1860] to-[#1a0e40] border-[1.5px] border-knd-gold/25 rounded-lg flex items-center justify-center">
                    <span className="text-[14px] text-knd-gold/40">☽</span>
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
            ✦ カードをシャッフル
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
            <ShareButtons text={shareText} url="https://konnyandou-buc7.vercel.app/tarot" />
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

// ─── Shared Sub-components ───

function RevealedCard({ card, isReversed }: { card: TarotCardType; isReversed: boolean }) {
  return (
    <div
      className="w-[140px] h-[210px] bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] border-2 border-knd-gold/50 rounded-xl flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(240,208,96,0.15),0_12px_40px_rgba(60,30,120,0.5)] animate-cardReveal"
      style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }}
    >
      <div className="text-[10px] text-knd-gold/60 tracking-[2px]">
        {String(card.id).padStart(1, '0')}
      </div>
      <div className="w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle,rgba(240,208,96,0.15),transparent)] flex items-center justify-center text-[30px]">
        {card.emoji}
      </div>
      <div className="text-base text-knd-gold font-display font-medium">{card.name}</div>
      <div className="text-[9px] text-knd-lavender/50 tracking-[1.5px]">{card.nameEn}</div>
    </div>
  );
}

function PositionBadge({ isReversed }: { isReversed: boolean }) {
  return (
    <div className="text-center mb-4">
      <span
        className="inline-block px-3.5 py-1 rounded-full text-[11px] font-body border"
        style={{
          background: isReversed ? 'rgba(180, 100, 200, 0.2)' : 'rgba(240, 208, 96, 0.15)',
          borderColor: isReversed ? 'rgba(180, 100, 200, 0.3)' : 'rgba(240, 208, 96, 0.3)',
          color: isReversed ? '#c8a0e0' : '#f0d060',
        }}
      >
        {isReversed ? '逆位置' : '正位置'}
      </span>
    </div>
  );
}

function ReadingBubble({ reading }: { reading: string }) {
  return (
    <div className="flex gap-3 items-start bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-4">
      <NoaAvatar size={40} borderColor="rgba(240, 208, 96, 0.3)" />
      <div>
        <div className="text-[11px] text-knd-gold font-body mb-1.5">ノアの解釈</div>
        <div className="text-[13.5px] leading-[1.8] text-[#d8d0e8] font-body whitespace-pre-wrap">
          {reading}
        </div>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center gap-3 animate-fadeSlideIn">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-knd-lavender"
            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <div className="text-knd-lavender/60 text-xs font-body">ツキに聞いてるよ…</div>
    </div>
  );
}

// ─── Main Page ───
export default function TarotPage() {
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
                <span className="text-2xl">✦</span>
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
                <span className="text-2xl">✦✦✦</span>
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
      </div>
    </div>
  );
}
