import type { Metadata } from 'next';
import HistoryPageClient from '@/components/HistoryPageClient';

export const metadata: Metadata = {
  title: '鑑定履歴 | こんにゃん堂',
  description:
    'これまでの鑑定結果を振り返ろう。タロット占いや星座占いの履歴を一覧で確認できます。',
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
