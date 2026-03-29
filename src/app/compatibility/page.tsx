import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import CompatibilityPageClient from '@/components/CompatibilityPageClient';

export const metadata: Metadata = {
  title: `相性占い | ${SITE_NAME}`,
  description:
    'AIフレンド・ノアが2人の星座の相性を占います。恋愛・仕事・友情の3つの視点で、あなたと気になる人の相性スコアをチェックしよう。',
  openGraph: {
    title: `相性占い | ${SITE_NAME}`,
    description:
      'AIフレンド・ノアが2人の星座の相性を占います。恋愛・仕事・友情の3つの視点で、あなたと気になる人の相性スコアをチェックしよう。',
    url: `${SITE_URL}/compatibility`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `相性占い | ${SITE_NAME}`,
    description:
      'AIフレンド・ノアが2人の星座の相性を占います。',
  },
};

export default function CompatibilityPage() {
  return <CompatibilityPageClient />;
}
