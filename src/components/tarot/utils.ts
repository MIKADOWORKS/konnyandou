import { TarotCard } from '@/types/tarot';
import { majorArcana } from '@/lib/tarot-data';

export interface CardPosition {
  x: number;
  rotation: number;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: string;
}

export const SPREAD_POSITIONS = ['過去', '現在', '未来'] as const;

export function drawRandomCard(exclude: TarotCard[]): { card: TarotCard; isReversed: boolean } {
  const available = majorArcana.filter((c) => !exclude.some((e) => e.id === c.id));
  const card = available[Math.floor(Math.random() * available.length)];
  const isReversed = Math.random() > 0.6;
  return { card, isReversed };
}
