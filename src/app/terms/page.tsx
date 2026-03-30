import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import StarField from '@/components/StarField';

export const metadata: Metadata = {
  title: `利用規約 | ${SITE_NAME}`,
  description: `${SITE_NAME}の利用規約です。サービスをご利用になる前にご確認ください。`,
  openGraph: {
    title: `利用規約 | ${SITE_NAME}`,
    description: `${SITE_NAME}の利用規約です。`,
    url: `${SITE_URL}/terms`,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen pb-24">
      <StarField />
      <div className="relative z-10 px-5 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-knd-gold font-display mb-2">
          利用規約
        </h1>
        <p className="text-knd-lavender/60 text-sm mb-8">制定日：2026年3月30日</p>

        <div className="space-y-8 text-[14px] leading-relaxed text-knd-lavender/80">

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">はじめに</h2>
            <p>
              この利用規約（以下「本規約」）は、MIKADO WORKS（以下「当社」）が提供するこんにゃん堂（https://konnyandou.jp、以下「本サービス」）のご利用条件を定めるものです。本サービスをご利用いただく前に、本規約をよくお読みください。本サービスをご利用いただいた場合、本規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">1. サービスの概要</h2>
            <p className="mb-3">
              本サービスは、AIを活用したエンターテインメント占いサービスです。AIフレンド「ノア」と白猫の使い魔「ツキ」が、タロット・星座・相性・数秘術などを通じて、日常のヒントや楽しみをお届けします。
            </p>
            <p>
              本サービスが提供する占い結果はすべてエンターテインメント目的であり、AIが生成するコンテンツです。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">2. 利用条件</h2>
            <ul className="space-y-3 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスは、日本国内外を問わずご利用いただけます。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>18歳未満の方がご利用になる場合は、保護者の同意を得た上でご利用ください。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスのご利用には、インターネット接続環境が必要です。通信料はお客様のご負担となります。</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">3. 禁止事項</h2>
            <p className="mb-3">お客様は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>法令または公序良俗に違反する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>当社または第三者の著作権、商標権などの知的財産権を侵害する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>当社または第三者の名誉・信用を傷つける行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスのシステムへの不正アクセス・過度な負荷をかける行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスを商業目的で無断利用する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>AIへの不適切・有害なコンテンツの入力</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>第三者の個人情報を無断で入力する行為</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>その他、当社が不適切と判断する行為</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">4. 免責事項</h2>
            <div className="bg-knd-indigo-light/40 rounded-xl p-4 border border-knd-purple/20 mb-4">
              <p className="text-knd-lavender/90 font-bold mb-2">重要なお知らせ</p>
              <p>
                本サービスが提供する占い結果はすべて<strong className="text-knd-gold">エンターテインメント目的</strong>であり、AIが生成したコンテンツです。医療・法律・金融投資・その他専門的なアドバイスを提供するものではありません。
              </p>
            </div>
            <ul className="space-y-3 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>占い結果をもとにした意思決定について、当社は一切の責任を負いません。健康・医療に関する事項は医療機関に、法律に関する事項は法律の専門家に、投資に関する事項は金融の専門家にご相談ください。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>本サービスは現状有姿で提供されます。当社は本サービスの正確性・完全性・有用性について保証しません。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>システム障害・メンテナンス・その他の理由によりサービスが利用できない場合でも、当社は責任を負いません。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>当社の責任は、日本の法律が認める範囲内に限定されます。</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">5. 知的財産権</h2>
            <p>
              本サービスのコンテンツ（テキスト・画像・デザイン・キャラクター設定など）に関する著作権その他の知的財産権は、当社または正当な権利を有する第三者に帰属します。お客様は、私的利用の範囲を超えて複製・転用・販売等をすることはできません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">6. サービスの変更・停止</h2>
            <p className="mb-3">
              当社は、以下の場合にお客様への事前通知なく、本サービスの内容を変更・一時停止・終了することがあります。
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>システムのメンテナンス・障害対応時</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>天災・停電・通信障害などの不可抗力が発生した場合</span>
              </li>
              <li className="flex gap-2">
                <span className="text-knd-gold shrink-0">・</span>
                <span>その他、当社が必要と判断した場合</span>
              </li>
            </ul>
            <p className="mt-3">
              サービスの変更・停止によってお客様に生じた損害について、当社は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">7. 外部サービスについて</h2>
            <p>
              本サービスはAnthropicのClaude API、Googleのサービス、Vercelなど第三者のサービスを利用しています。これらのサービスの利用には各社の利用規約・プライバシーポリシーが適用されます。当社は外部サービスの変更・停止・障害について責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">8. 規約の変更</h2>
            <p>
              当社は、必要に応じて本規約を変更することがあります。変更後の規約は、本ページに掲載した時点で効力を生じるものとします。重要な変更がある場合は、本サービス上でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">9. 準拠法・裁判管轄</h2>
            <p className="mb-3">
              本規約は日本法に準拠します。本規約または本サービスに関する一切の紛争については、東京地方裁判所または東京簡易裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-knd-lavender mb-3">10. お問い合わせ</h2>
            <p className="mb-2">本規約に関するお問い合わせは、以下までご連絡ください。</p>
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
