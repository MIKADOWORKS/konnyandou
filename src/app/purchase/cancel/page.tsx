import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import StarField from '@/components/StarField';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `購入キャンセル | ${SITE_NAME}`,
  robots: { index: false },
};

export default function PurchaseCancelPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <StarField />
      <div className="relative z-10 px-5 pt-24 pb-8 flex flex-col items-center text-center">
        <div className="text-4xl mb-6 animate-fadeSlideIn">
          {'\u{1F431}'}
        </div>
        <h1 className="text-xl font-bold text-knd-lavender font-display mb-3 animate-fadeSlideIn"
          style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          またいつでも来てね！
        </h1>
        <p className="text-[14px] text-knd-lavender/70 mb-8 animate-fadeSlideIn"
          style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
          毎日3回まで無料でチャットできるよ
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold text-knd-lavender font-display border border-knd-purple/40 bg-knd-purple/20 hover:bg-knd-purple/30 transition-all animate-fadeSlideIn"
          style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
