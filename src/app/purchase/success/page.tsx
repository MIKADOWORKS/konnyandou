import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import StarField from '@/components/StarField';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `購入完了 | ${SITE_NAME}`,
  robots: { index: false },
};

export default function PurchaseSuccessPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <StarField />
      <div className="relative z-10 px-5 pt-24 pb-8 flex flex-col items-center text-center">
        <div className="text-5xl mb-6 animate-fadeSlideIn">
          {'\u2728'}
        </div>
        <h1 className="text-xl font-bold text-knd-gold font-display mb-3 animate-fadeSlideIn"
          style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          チケットを購入したよ！
        </h1>
        <p className="text-[14px] text-knd-lavender/70 mb-8 animate-fadeSlideIn"
          style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
          ありがとう！さっそくノアとお話ししよう
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold font-display transition-all animate-fadeSlideIn"
          style={{
            background: 'linear-gradient(135deg, #f0d060, #c8a030)',
            color: '#1a0e40',
            animationDelay: '0.3s',
            animationFillMode: 'backwards',
          }}
        >
          チャットに戻る
        </Link>
      </div>
    </div>
  );
}
