import type { Metadata } from 'next';
import './globals.css';
import BottomTabNav from '@/components/BottomTabNav';
import { SITE_URL } from '@/lib/constants';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <div className="max-w-[430px] mx-auto min-h-screen relative bg-gradient-to-b from-knd-indigo via-[#120838] to-[#0e0628] overflow-hidden">
          <main>{children}</main>
          <BottomTabNav />
        </div>
      </body>
    </html>
  );
}
