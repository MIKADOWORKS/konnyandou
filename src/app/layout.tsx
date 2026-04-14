import type { Metadata } from 'next';
import Link from 'next/link';
import { Zen_Maru_Gothic, Noto_Sans_JP } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import BottomTabNav from '@/components/BottomTabNav';
import { SITE_URL } from '@/lib/constants';
import { getWebSiteJsonLd, getOrganizationJsonLd } from '@/lib/jsonld';

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zen-maru',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'こんにゃん堂 | AIフレンド・ノアとツキのタロット占い',
  description:
    'AIフレンド・ノアと白猫の使い魔ツキが、タロットであなたの毎日にヒントをお届け。こんにゃん出ましたけど〜！',
  openGraph: {
    title: 'こんにゃん堂 | AIフレンド・ノアとツキのタロット占い',
    description:
      'AIフレンド・ノアと白猫の使い魔ツキが、タロットであなたの毎日にヒントをお届け。',
    url: 'https://konnyandou.jp',
    siteName: 'こんにゃん堂',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenMaruGothic.variable} ${notoSansJP.variable}`}>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }}
        />
        <div className="max-w-[430px] mx-auto min-h-screen relative bg-gradient-to-b from-knd-indigo via-[#120838] to-[#0e0628] overflow-hidden">
          <main>{children}</main>
          {/* Footer links (最下部の控えめな導線) */}
          <footer className="relative z-10 px-5 pt-6 pb-4 text-center">
            <div className="border-t border-knd-lavender/10 pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-knd-lavender/45 font-body">
              <Link href="/about" className="hover:text-knd-lavender/80 transition-colors">
                こんにゃん堂について
              </Link>
              <span className="text-knd-lavender/20">·</span>
              <Link href="/noa" className="hover:text-knd-lavender/80 transition-colors">
                ノアについて
              </Link>
              <span className="text-knd-lavender/20">·</span>
              <Link href="/privacy" className="hover:text-knd-lavender/80 transition-colors">
                プライバシー
              </Link>
              <span className="text-knd-lavender/20">·</span>
              <Link href="/terms" className="hover:text-knd-lavender/80 transition-colors">
                利用規約
              </Link>
            </div>
            <p className="mt-3 text-[10px] text-knd-lavender/30 font-body">
              こんにゃん堂 © 2026 MIKADO WORKS
            </p>
          </footer>
          {/* BottomTabNav の高さ分のスペーサー */}
          <div className="h-20" />
          <BottomTabNav />
        </div>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9975836212100204"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KEQMT6ZV0C"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-KEQMT6ZV0C');
        `}</Script>
        <Analytics />
      </body>
    </html>
  );
}
