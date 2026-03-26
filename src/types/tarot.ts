export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  emoji: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
}

export interface TarotDrawResult {
  card: TarotCard;
  isReversed: boolean;
}

export interface TarotReadingResult {
  card: TarotCard;
  isReversed: boolean;
  reading: string;
}
