'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { majorArcana } from '@/lib/tarot-data';
import { TarotCard as TarotCardType } from '@/types/tarot';
import TarotCard from '@/components/TarotCard';
import TarotReading from '@/components/TarotReading';
import TsukiAnimation from '@/components/TsukiAnimation';
import StarField from '@/components/StarField';

type Phase = 'input' | 'drawing' | 'reveal' | 'loading' | 'result';

export default function TarotPage() {
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [reading, setReading] = useState('');

  const drawCard = useCallback(async () => {
    setPhase('drawing');

    // ランダムにカード選択
    const card = majorArcana[Math.floor(Math.random() * majorArcana.length)];
    const reversed = Math.random() < 0.5;
    setSelectedCard(card);
    setIsReversed(reversed);

    // カードめくり演出のための待機
    await new Promise((r) => setTimeout(r, 800));
    setPhase('reveal');

    // めくった後の余韻
    await new Promise((r) => setTimeout(r, 1500));
    setPhase('loading');

    // API呼び出し
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
      setPhase('result');
    } catch {
      setReading(
        'こんにゃん出ましたけど〜！ごめんね、ちょっとツキの電波が不安定みたい…🐱 もう一回試してみて！…ってことで、こんなんどう？'
      );
      setPhase('result');
    }
  }, [question]);

  const reset = useCallback(() => {
    setPhase('input');
    setSelectedCard(null);
    setIsReversed(false);
    setReading('');
    setQuestion('');
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-knd-indigo via-knd-indigo-light to-knd-indigo pt-20 pb-12 px-4">
      <StarField />

      <div className="relative z-10 max-w-lg mx-auto">
        <h1 className="font-display font-bold text-2xl text-knd-gold text-center mb-8">
          タロット1枚引き
        </h1>

        <AnimatePresence mode="wait">
          {/* 入力フェーズ */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="question"
                  className="block text-knd-lavender text-sm font-display"
                >
                  聞きたいことを入力してね（空欄でもOK）
                </label>
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例：今日の仕事運は？"
                  className="w-full px-4 py-3 rounded-xl bg-knd-indigo-light/80 border border-knd-purple/30 text-white placeholder-knd-lavender/40 focus:outline-none focus:border-knd-lavender/60 font-body text-sm"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={drawCard}
                  className="bg-gradient-to-r from-knd-purple to-knd-lavender text-white font-display font-bold px-8 py-3 rounded-full text-lg shadow-lg shadow-knd-purple/30 hover:shadow-knd-purple/50 hover:scale-105 transition-all"
                >
                  カードを引く ✨
                </button>
              </div>

              {/* プレースホルダーカード */}
              <div className="flex justify-center pt-4">
                <TarotCard card={null} isReversed={false} isFlipped={false} />
              </div>
            </motion.div>
          )}

          {/* カード選択～表示フェーズ */}
          {(phase === 'drawing' || phase === 'reveal') && (
            <motion.div
              key="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <TarotCard
                card={selectedCard}
                isReversed={isReversed}
                isFlipped={phase === 'reveal'}
              />
            </motion.div>
          )}

          {/* ローディングフェーズ */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <TarotCard
                card={selectedCard}
                isReversed={isReversed}
                isFlipped={true}
              />
              <TsukiAnimation isLoading />
            </motion.div>
          )}

          {/* 結果表示フェーズ */}
          {phase === 'result' && selectedCard && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <TarotCard
                  card={selectedCard}
                  isReversed={isReversed}
                  isFlipped={true}
                />
              </div>

              <TarotReading
                card={selectedCard}
                isReversed={isReversed}
                reading={reading}
              />

              <div className="flex flex-col items-center gap-3 pt-4">
                <button
                  onClick={reset}
                  className="bg-gradient-to-r from-knd-purple to-knd-lavender text-white font-display font-bold px-6 py-2.5 rounded-full shadow-lg shadow-knd-purple/30 hover:shadow-knd-purple/50 hover:scale-105 transition-all"
                >
                  もう一度引く
                </button>
                <button
                  disabled
                  className="text-knd-lavender/40 text-sm font-display cursor-not-allowed"
                >
                  シェアする（準備中）
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
