import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import StarField from '@/components/StarField';

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${SITE_NAME}`,
  description: `${SITE_NAME}の特定商取引法に基づく表記です。`,
  openGraph: {
    title: `特定商取引法に基づく表記 | ${SITE_NAME}`,
    description: `${SITE_NAME}の特定商取引法に基づく表記です。`,
    url: `${SITE_URL}/tokushoho`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
};

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="border-b border-knd-purple/20 py-4">
      <dt className="text-knd-lavender font-bold text-[13px] mb-1.5">{label}</dt>
      <dd className="text-knd-lavender/80 text-[14px] leading-relaxed">{children}</dd>
    </div>
  );
}

export default function TokushohoPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <StarField />
      <div className="relative z-10 px-5 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-knd-gold font-display mb-2">
          特定商取引法に基づく表記
        </h1>
        <p className="text-knd-lavender/60 text-sm mb-8">制定日：2026年4月5日</p>

        <dl className="bg-knd-indigo-light/20 rounded-xl border border-knd-purple/20 px-4">
          <InfoRow label="事業者名">MIKADO WORKS</InfoRow>
          <InfoRow label="代表者名">小林 帝久</InfoRow>
          <InfoRow label="所在地">
            〒230-0001 神奈川県横浜市鶴見区矢向5-13-27
          </InfoRow>
          <InfoRow label="連絡先">
            メール：<a href="mailto:info@mikadoworks.com" className="text-knd-gold hover:text-knd-gold/80 transition-colors">info@mikadoworks.com</a>
          </InfoRow>
          <InfoRow label="販売価格">
            チャットチケット: 300円（税込）/回（15往復分）、3枚スプレッドチケット: 150円（税込）/回。
            その他のサービスについては各サービスページに表示される価格に準じます。
          </InfoRow>
          <InfoRow label="支払方法">
            クレジットカード（Stripe経由）
          </InfoRow>
          <InfoRow label="支払時期">
            購入手続き完了時に即時決済されます。
          </InfoRow>
          <InfoRow label="商品の引渡時期">
            決済完了後、即時ご利用いただけます。
          </InfoRow>
          <InfoRow label="返品・キャンセルについて">
            デジタルコンテンツの性質上、購入後の返品・返金は原則としてお受けできません。ただし、サービスに重大な不具合がある場合は、個別にご対応いたしますのでお問い合わせください。
          </InfoRow>
          <InfoRow label="動作環境">
            最新版の Google Chrome、Safari、Microsoft Edge 等のモダンブラウザ。インターネット接続が必要です。
          </InfoRow>
        </dl>
      </div>
    </div>
  );
}
