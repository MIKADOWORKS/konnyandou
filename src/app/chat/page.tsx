import type { Metadata } from 'next';
import ChatPageClient from '@/components/ChatPageClient';

export const metadata: Metadata = {
  title: 'ノアに相談 | こんにゃん堂',
  description:
    'AIフレンド・ノアにチャットで気軽に相談。恋愛・仕事・人間関係…なんでも聞いてね。',
};

export default function ChatPage() {
  return <ChatPageClient />;
}
