import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import TarotPageClient from '@/components/tarot/TarotPageClient';

export const metadata: Metadata = {
  title: `タロット占い | ${SITE_NAME}`,
  description:
    'AIフレンド・ノアがタロットカードであなたの運勢を占います。一枚引きや3枚スプレッドで、今日のメッセージを受け取ろう。',
  openGraph: {
    title: `タロット占い | ${SITE_NAME}`,
    description: 'AIフレンド・ノアがタロットカードであなたの運勢を占います。',
    url: `${SITE_URL}/tarot`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `タロット占い | ${SITE_NAME}`,
    description: 'AIフレンド・ノアがタロットカードであなたの運勢を占います。',
  },
};

export default function TarotPage() {
  return <TarotPageClient />;
}
