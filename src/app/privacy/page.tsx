import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import StarField from '@/components/StarField';

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
  description: `${SITE_NAME}のプライバシーポリシーです。個人情報の取り扱いについてご確認ください。`,
  openGraph: {
    title: `プライバシーポリシー | ${SITE_NAME}`,
    description: `${SITE_NAME}のプライバシーポリシーです。`,
    url: `${SITE_URL}/privacy`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <StarField />
      <div className="relative z-10 px-5 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-knd-gold font-display mb-2">
          プライバシーポリシー
        </h1>
        <p className="text-knd-lavender/60 text-sm mb-8">制定日：2026年3月30日</p>

        <div className="space-y-8 text-[14px] leading-relaxed text-knd-lavender/80">

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">はじめに</h2>
            <p>
              MIKADO WORKS（以下「当社」）は、こんにゃん堂（https://konnyandou.jp、以下「本サービス」）をご利用いただくお客様のプライバシーを尊重し、個人情報の適切な管理に努めます。本プライバシーポリシーは、本サービスにおける情報の収集・利用・管理に関する方針を定めるものです。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">1. 収集する情報</h2>
            <p className="mb-2">本サービスでは、以下の情報を収集することがあります。</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span><strong className="text-knd-lavender">アクセスログ：</strong>IPアドレス、ブラウザの種類・バージョン、アクセス日時、参照元URL、閲覧ページなど</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span><strong className="text-knd-lavender">Cookie：</strong>サービスの利便性向上や利用状況の分析のため、Cookieを使用します</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span><strong className="text-knd-lavender">占い入力情報：</strong>占い機能ご利用時に入力していただく情報（生年月日・質問内容・お名前など）</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">2. Google Analytics 4 による情報収集</h2>
            <p className="mb-3">
              本サービスでは、Googleが提供するアクセス解析ツール「Google Analytics 4」を使用しています。Google Analytics 4はCookieを使用して利用者の行動データを収集・分析しますが、個人を特定する情報は収集しません。
            </p>
            <p className="mb-3">
              収集されたデータはGoogleのプライバシーポリシーに基づいて管理されます。
            </p>
            <p className="mb-2">
              Google Analytics 4によるデータ収集を無効にしたい場合は、以下の方法でオプトアウトできます。
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>Googleアナリティクス オプトアウト アドオン（ブラウザ拡張機能）をインストールする</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>ブラウザの設定でCookieを無効にする</span>
              </li>
            </ul>
            <p className="mt-3 text-knd-lavender/60 text-[13px]">
              詳細：<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-knd-lavender transition-colors">Googleプライバシーポリシー</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">3. Vercel Analytics によるアクセス解析</h2>
            <p className="mb-3">
              本サービスでは、ホスティング事業者であるVercel Inc.が提供する「Vercel Analytics」を使用して、ページビュー数や参照元などの匿名化された利用統計を収集しています。Vercel Analyticsは個人を特定するCookieを使用せず、IPアドレスも取得後すぐに匿名化されるため、個人を特定する形での情報収集は行われません。
            </p>
            <p className="mt-0 text-knd-lavender/60 text-[13px]">
              詳細：<a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-knd-lavender transition-colors">Vercel Analytics プライバシーポリシー</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">4. Google AdSense による広告配信</h2>
            <p className="mb-3">
              本サービスでは、Googleが提供する広告配信サービス「Google AdSense」を使用しています。Google AdSenseは、ユーザーの興味に合わせた広告を表示するためにCookieを使用します。
            </p>
            <p className="mb-3">
              第三者配信事業者であるGoogleを含む広告配信事業者は、ユーザーが本サービスや他のサイトへアクセスした情報に基づいて広告を配信するためにCookieを使用することがあります。お客様はGoogle広告設定ページにアクセスすることで、Googleによるパーソナライズ広告配信を無効化することが可能です。
            </p>
            <p className="mb-2">
              パーソナライズ広告を無効にする場合は、以下をご利用ください。
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span><a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-knd-lavender transition-colors">Google広告設定ページ</a></span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>ブラウザの設定でCookieを無効にする</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">5. Anthropic Claude API への入力データ</h2>
            <p className="mb-3">
              本サービスの占い機能は、Anthropic社が提供するClaude APIを使用しています。占いの質問内容・生年月日などの入力情報はAnthropicのサーバーに送信され、AIによる占い結果の生成に使用されます。
            </p>
            <p className="mb-3">
              当社は、送信されたデータを当社のサーバーに永続的に保存することはありません（履歴機能を除く）。Anthropicにおける入力データの取り扱いについては、Anthropicのプライバシーポリシーをご確認ください。
            </p>
            <p className="mb-2 font-bold text-knd-lavender/90">
              なお、入力する際は以下にご注意ください。
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>氏名・住所・電話番号などの個人を特定できる情報の入力はお控えください</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>第三者の個人情報を入力しないようにしてください</span>
              </li>
            </ul>
            <p className="mt-3 text-knd-lavender/60 text-[13px]">
              詳細：<a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-knd-lavender transition-colors">Anthropicプライバシーポリシー</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">6. 情報の利用目的</h2>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスの提供・運営・改善</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>利用状況の分析とサービス品質向上</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>不正利用の防止</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>広告の配信・最適化</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">7. 第三者への提供</h2>
            <p className="mb-3">
              当社は、以下の場合を除き、お客様の情報を第三者に提供することはありません。
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>お客様の同意がある場合</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>法令に基づく場合</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>人の生命・身体・財産の保護のために必要な場合</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>サービス提供に必要な業務委託先（Google、Anthropic、Vercelなど）への提供</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">8. Cookie の管理</h2>
            <p>
              お客様はブラウザの設定によりCookieを無効にすることができます。ただし、Cookieを無効にした場合、本サービスの一部機能が正常に動作しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">9. プライバシーポリシーの変更</h2>
            <p>
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">10. お問い合わせ</h2>
            <p className="mb-2">本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください。</p>
            <div className="bg-knd-indigo-light/40 rounded-xl p-4 border border-knd-purple/20">
              <p className="font-bold text-knd-lavender mb-1">MIKADO WORKS</p>
              <p>
                メール：<a href="mailto:info@konnyandou.jp" className="text-knd-gold hover:text-knd-gold/80 transition-colors">info@konnyandou.jp</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
