import type { Metadata } from 'next';
import TarotPageClient from '@/components/tarot/TarotPageClient';

export const metadata: Metadata = {
  title: 'タロット占い | こんにゃん堂',
  description:
    'AIフレンド・ノアがタロットカードであなたの運勢を占います。一枚引きや3枚スプレッドで、今日のメッセージを受け取ろう。',
};

export default function TarotPage() {
  return <TarotPageClient />;
}
