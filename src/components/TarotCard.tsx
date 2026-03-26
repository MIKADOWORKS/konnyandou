'use client';

import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/types/tarot';

interface TarotCardProps {
  card: TarotCardType | null;
  isReversed: boolean;
  isFlipped: boolean;
  onClick?: () => void;
}

export default function TarotCard({ card, isReversed, isFlipped, onClick }: TarotCardProps) {
  return (
    <div className="perspective-[1000px] w-44 h-64 cursor-pointer" onClick={onClick}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* 裏面 */}
        <div
          className="absolute inset-0 rounded-xl card-back-pattern border-2 border-knd-gold/50 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div className="text-knd-gold text-4xl mb-2">✦</div>
            <div className="w-20 h-28 border border-knd-gold/30 rounded-lg mx-auto flex items-center justify-center">
              <div className="text-knd-gold/50 text-xs font-display">こんにゃん堂</div>
            </div>
            <div className="text-knd-gold text-4xl mt-2">✦</div>
          </div>
        </div>

        {/* 表面 */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-b from-knd-indigo-light to-knd-indigo border-2 border-knd-lavender/50 flex flex-col items-center justify-center p-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {card && (
            <div
              className="flex flex-col items-center gap-2"
              style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }}
            >
              <span className="text-5xl">{card.emoji}</span>
              <p className="font-display font-bold text-knd-gold text-lg">{card.name}</p>
              <p className="text-knd-lavender/70 text-xs">{card.nameEn}</p>
            </div>
          )}
          {card && (
            <p className="mt-3 text-xs font-display text-knd-pink">
              {isReversed ? '逆位置' : '正位置'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
