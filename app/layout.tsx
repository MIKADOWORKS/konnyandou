import type { Metadata } from 'next';
import { Zen_Maru_Gothic, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
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
    <html lang="ja" className={`${zenMaruGothic.variable} ${notoSansJP.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
