import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import ChatPageClient from '@/components/ChatPageClient';

export const metadata: Metadata = {
  title: `ノアに相談 | ${SITE_NAME}`,
  description:
    'AIフレンド・ノアにチャットで気軽に相談。恋愛・仕事・人間関係…なんでも聞いてね。',
  openGraph: {
    title: `ノアに相談 | ${SITE_NAME}`,
    description: 'AIフレンド・ノアにチャットで気軽に相談。恋愛・仕事・人間関係…なんでも聞いてね。',
    url: `${SITE_URL}/chat`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `ノアに相談 | ${SITE_NAME}`,
    description: 'AIフレンド・ノアにチャットで気軽に相談。なんでも聞いてね。',
  },
};

export default function ChatPage() {
  return <ChatPageClient />;
}
