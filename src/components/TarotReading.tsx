'use client';

import { TarotCard } from '@/types/tarot';
import NoaMessage from './NoaMessage';

interface TarotReadingProps {
  card: TarotCard;
  isReversed: boolean;
  reading: string;
}

export default function TarotReading({ card, isReversed, reading }: TarotReadingProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="text-center">
        <p className="text-knd-gold font-display text-lg">
          {card.emoji} {card.name}（{card.nameEn}）
        </p>
        <p className="text-knd-lavender/70 text-sm">
          {isReversed ? '逆位置' : '正位置'}
        </p>
      </div>
      <NoaMessage message={reading} />
    </div>
  );
}
