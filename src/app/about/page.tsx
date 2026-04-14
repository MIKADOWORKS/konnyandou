import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';
import NoaAvatar from '@/components/NoaAvatar';
import { getWebPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: `こんにゃん堂について | ${SITE_NAME}`,
  description:
    'AI占い師ノアと白猫の使い魔ツキが鑑定する、手軽に無料で楽しめるWeb占いサービス「こんにゃん堂」のサイト理念・キャラクター・サービス内容・運営者情報をご紹介します。',
  openGraph: {
    title: `こんにゃん堂について | ${SITE_NAME}`,
    description:
      'AI占い師ノアと白猫の使い魔ツキが鑑定する、手軽に楽しめるWeb占いサービス「こんにゃん堂」について。',
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `こんにゃん堂について | ${SITE_NAME}`,
    description:
      'AI占い師ノアと白猫の使い魔ツキが鑑定する、手軽に楽しめるWeb占いサービスについて。',
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  href?: string;
}

const services: ServiceItem[] = [
  {
    icon: '✦',
    title: 'タロット占い',
    description:
      '1枚引き・3枚スプレッドの2種類。ウェイト版タロットの伝統的な意味をベースに、ノアがあなたの質問に寄り添った解釈をお届けします。',
    href: '/tarot',
  },
  {
    icon: '☽',
    title: '12星座の今日の運勢',
    description:
      '12星座それぞれの今日の運勢を毎日更新。恋愛運・仕事運・金運のカテゴリ別評価つきで、ノアが優しくアドバイスします。',
    href: '/',
  },
  {
    icon: '🔢',
    title: '数秘術',
    description:
      '生年月日から導き出すライフパスナンバーで、あなたの本質や今日の過ごし方のヒントをお伝えします。',
    href: '/numerology',
  },
  {
    icon: '💕',
    title: '相性占い',
    description:
      'お相手との相性を星座や誕生日から読み解きます。気になるあの人との距離感をノアが一緒に考えます。',
    href: '/compatibility',
  },
  {
    icon: '💬',
    title: 'ノアに相談',
    description:
      'チャット形式でノアに直接相談できます。占いのこと、日常のモヤモヤ、ちょっとした悩みごとまで気軽にどうぞ。',
    href: '/chat',
  },
];

const disclaimerItems = [
  '本サービスが提供する占い結果はエンターテインメント目的であり、重要な意思決定の根拠として使用することは想定していません。',
  '医療・法律・金融投資・その他専門的なアドバイスを提供するものではありません。健康・法律・お金に関するお悩みは、各分野の専門家にご相談ください。',
  'AIによる生成コンテンツのため、同じ条件でも毎回異なる結果が出ることがあります。あくまで日常の気づきやヒントとしてお楽しみください。',
];

export default function AboutPage() {
  const jsonLd = getWebPageJsonLd({
    name: `こんにゃん堂について | ${SITE_NAME}`,
    description:
      'AI占い師ノアと白猫の使い魔ツキが鑑定する、手軽に無料で楽しめるWeb占いサービスについて。',
    url: `${SITE_URL}/about`,
  });

  return (
    <div className="relative min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StarField />
      <ConstellationDecor className="top-20 -right-8 w-[180px]" />
      <ConstellationDecor className="top-[560px] -left-10 w-[160px] rotate-45" />

      <div className="relative z-10 px-5 pt-12 pb-8">
        {/* ヘッダー */}
        <div className="text-center mb-8 animate-fadeSlideIn">
          <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-2 font-body">
            ABOUT
          </div>
          <h1 className="text-[26px] font-display font-medium text-knd-gold tracking-[3px] mb-2">
            こんにゃん堂について
          </h1>
          <p className="text-[11px] text-knd-lavender/50 tracking-[2px]">
            KONNYANDOU — AI FORTUNE TELLING
          </p>
        </div>

        <div className="space-y-8 text-[14px] leading-relaxed text-knd-lavender/80">
          {/* サイトの理念 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              サイトの理念
            </h2>
            <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-5">
              <p className="mb-3">
                「こんにゃん堂」は、AI占い師ノアと白猫の使い魔ツキが鑑定する、手軽に無料で楽しめるWeb占いサービスです。
              </p>
              <p className="mb-3">
                占いはもともと「ちょっと背中を押してほしい」「今日をどう過ごそうか迷っている」そんな気持ちに寄り添うものだと考えています。だから私たちは、難しい専門用語や重々しい予言ではなく、
                <span className="text-knd-gold/90">
                  友達と話すような温度感
                </span>
                で届く占いを目指しました。
              </p>
              <p>
                占いライト層の方にも気軽に楽しんでいただけるよう、基本機能はすべて無料。毎日の気分転換に、ちょっとした迷いの整理に、のぞきに来てもらえたら嬉しいです。
              </p>
            </div>
          </section>

          {/* キャラクター紹介 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              ノアとツキについて
            </h2>

            {/* ノア */}
            <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-5 mb-3">
              <div className="flex gap-3 items-center mb-3">
                <NoaAvatar size={56} />
                <div>
                  <p className="text-[15px] text-knd-gold font-display font-medium">
                    ノア
                  </p>
                  <p className="text-[11px] text-knd-lavender/50 font-body">
                    占い好きのフリーランス・23歳
                  </p>
                </div>
              </div>
              <p className="mb-2">
                ノアは東京・吉祥寺あたりに住む23歳のフリーランス。高校の図書室でタロットに出会って以来ずっと占いが好きで、大学では文学部に進み、中世ヨーロッパの象徴体系を研究するほどの本格派です。
              </p>
              <p className="mb-2">
                でも本人は「占い師」を名乗らず、
                <span className="text-knd-gold/90">
                  「占い好きの友達」
                </span>
                として話せる存在でいたいと考えています。明るくて話好き、でも共感力が高くて聞き上手。タロットのこともちゃんと知っているから、あなたの質問に一緒に向き合ってくれます。
              </p>
              <p className="text-[13px] text-knd-lavender/60">
                口調はラフで親しみやすく、「こんにゃん出ましたけど〜！」が口癖。
              </p>
            </div>

            {/* ツキ */}
            <div className="bg-gradient-to-br from-[#2a1860]/40 to-[#1a0e40]/40 border border-knd-lavender/10 rounded-2xl p-5">
              <div className="flex gap-3 items-center mb-3">
                <div className="w-14 h-14 rounded-full bg-knd-gold/10 border border-knd-gold/20 flex items-center justify-center text-[26px] shrink-0">
                  🐱
                </div>
                <div>
                  <p className="text-[15px] text-knd-gold font-display font-medium">
                    ツキ
                  </p>
                  <p className="text-[11px] text-knd-lavender/50 font-body">
                    白猫の使い魔・推定3歳
                  </p>
                </div>
              </div>
              <p className="mb-2">
                ツキは、ノアが大学卒業直後の雨の日に近所の神社の軒下で拾った白猫。月夜に拾ったから「ツキ」と名付けられました。うすい金色の瞳をしていて、カードの上に座るのが得意技。
              </p>
              <p>
                ノア曰く、タロットの結果を「降ろしてくる」使い魔的存在。普段は「にゃ〜」としか鳴かないけれど、占いのときだけ不思議とノアの言葉を後押ししてくれる、そんな相棒です。
              </p>
            </div>

            <div className="mt-3 text-right">
              <Link
                href="/noa"
                className="inline-flex items-center gap-1 text-[12px] text-knd-gold/80 hover:text-knd-gold transition-colors font-body"
              >
                ノアの詳しいプロフィールを見る
                <span>›</span>
              </Link>
            </div>
          </section>

          {/* サービス内容 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              サービス内容
            </h2>
            <div className="space-y-2.5">
              {services.map((item) => {
                const inner = (
                  <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-4 flex gap-3 items-start transition-colors hover:border-knd-gold/25">
                    <span className="text-[20px] text-knd-gold/80 shrink-0 pt-0.5">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-knd-lavender font-bold mb-1">
                        {item.title}
                      </p>
                      <p className="text-[12.5px] text-knd-lavender/70 leading-[1.7]">
                        {item.description}
                      </p>
                    </div>
                    {item.href && (
                      <span className="text-knd-lavender/40 text-base shrink-0">
                        ›
                      </span>
                    )}
                  </div>
                );
                return item.href ? (
                  <Link key={item.title} href={item.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div key={item.title}>{inner}</div>
                );
              })}
            </div>
          </section>

          {/* 運営ポリシー・免責 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              運営ポリシー・免責事項
            </h2>
            <div className="bg-knd-indigo-light/40 rounded-2xl p-5 border border-knd-purple/20">
              <p className="text-knd-lavender/90 font-bold mb-3">
                占いはエンターテインメントです
              </p>
              <ul className="space-y-3 pl-1">
                {disclaimerItems.map((text, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-knd-gold shrink-0 pt-0.5">・</span>
                    <span className="text-[13px] leading-[1.8]">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] text-knd-lavender/60">
                詳しい利用条件は
                <Link
                  href="/terms"
                  className="underline text-knd-gold/80 hover:text-knd-gold transition-colors mx-1"
                >
                  利用規約
                </Link>
                をご覧ください。
              </p>
            </div>
          </section>

          {/* 運営者情報 */}
          <section
            className="animate-fadeSlideIn"
            style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
          >
            <h2 className="text-base font-bold text-knd-lavender mb-3 flex items-center gap-2">
              <span className="text-knd-gold">✦</span>
              運営者情報
            </h2>
            <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl p-5">
              <dl className="space-y-3">
                <div>
                  <dt className="text-[11px] text-knd-lavender/50 font-body mb-1 tracking-wider">
                    運営者
                  </dt>
                  <dd className="text-[14px] text-knd-lavender">
                    MIKADO WORKS（代表者：小林 帝久）
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-knd-lavender/50 font-body mb-1 tracking-wider">
                    サービス名
                  </dt>
                  <dd className="text-[14px] text-knd-lavender">
                    こんにゃん堂（https://konnyandou.jp）
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-knd-lavender/50 font-body mb-1 tracking-wider">
                    お問い合わせ
                  </dt>
                  <dd className="text-[14px] text-knd-lavender">
                    <a
                      href="mailto:info@konnyandou.jp"
                      className="text-knd-gold hover:text-knd-gold/80 transition-colors"
                    >
                      info@konnyandou.jp
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] text-knd-lavender/60 leading-relaxed">
                本サービスは現時点ではすべての機能を無料でご提供しています。有料販売は行っていないため、特定商取引法に基づく表記は設けておりません。
              </p>
            </div>
          </section>

          {/* フッター導線 */}
          <section
            className="animate-fadeSlideIn pt-2"
            style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
          >
            <Link
              href="/"
              className="flex items-center justify-between w-full bg-gradient-to-r from-knd-gold/15 to-knd-purple/15 border border-knd-gold/30 rounded-2xl px-5 py-4 transition-all active:scale-95"
            >
              <div>
                <p className="text-[14px] text-knd-gold font-body font-medium">
                  さっそく占ってみる
                </p>
                <p className="text-[11px] text-knd-lavender/50 font-body mt-0.5">
                  今日の運勢からどうぞ
                </p>
              </div>
              <span className="text-knd-gold/60 text-lg">›</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
