import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import NumerologyPageClient from '@/components/NumerologyPageClient';

export const metadata: Metadata = {
  title: `数秘術占い | ${SITE_NAME}`,
  description:
    'AIフレンド・ノアが生年月日からライフパスナンバーを計算して、あなたの本質や運命の数字を読み解きます。数秘術で自分だけの数字が持つ意味を知ろう。',
  openGraph: {
    title: `数秘術占い | ${SITE_NAME}`,
    description:
      'AIフレンド・ノアが生年月日からライフパスナンバーを計算して、あなたの本質や運命の数字を読み解きます。',
    url: `${SITE_URL}/numerology`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `数秘術占い | ${SITE_NAME}`,
    description: 'AIフレンド・ノアが生年月日からライフパスナンバーを読み解きます。',
  },
};

export default function NumerologyPage() {
  return <NumerologyPageClient />;
}
