import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import StarField from '@/components/StarField';
import ConstellationDecor from '@/components/ConstellationDecor';

export const metadata: Metadata = {
  title: 'ノアについて | こんにゃん堂',
  description:
    '占い好きのフリーランス、ノア（23歳）と白猫の使い魔ツキのプロフィール。東京・吉祥寺エリア在住。タロットの知識はガチ本格派。',
};

const profileItems = [
  { label: '年齢', value: '23歳' },
  { label: '拠点', value: '東京の西側（吉祥寺あたり）' },
  { label: '専門', value: 'タロット・占星術・カバラ研究' },
  { label: '愛猫', value: '白猫のツキ（推定3歳）' },
  { label: '大学', value: '文学部卒（卒論テーマ：中世ヨーロッパの象徴体系）' },
];

const favorites = [
  { icon: '🍮', text: 'コンビニの固めプリン' },
  { icon: '🍵', text: 'ほうじ茶ラテ・白湯' },
  { icon: '🎴', text: 'タロットデッキ収集（7つ持ってる）' },
  { icon: '🌿', text: '井の頭公園のお散歩' },
  { icon: '📚', text: '古書店めぐり' },
  { icon: '🍂', text: '秋（「空気が澄んでカードの声がよく聞こえる」）' },
];

const storyItems = [
  '高校の図書室でたまたまタロットの本に出会って以来、ずっと占いが好き。',
  '大学では文学部で中世ヨーロッパの象徴体系を研究——本当はタロットの図像が知りたかっただけ。',
  '大学3年の冬、古書店でウェイト版タロットの初版復刻デッキを衝動買い。バイト代3ヶ月分飛んだ。',
  '就活は途中でやめて、フリーランスとして占い活動を始める。「なんか違う」が口癖だったらしい。',
  '卒業直後の雨の日、近所の神社の軒下にいた子猫を連れて帰り「ツキ」と名付ける。',
];

export default function NoaPage() {
  return (
    <div className="relative min-h-screen pb-28">
      <StarField />
      <ConstellationDecor />

      {/* ヒーローイラスト */}
      <div className="relative z-10 w-full">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src="/images/noa-profile.png"
            alt="ノアとツキのイラスト"
            fill
            priority
            className="object-cover object-top"
          />
          {/* 下端をページ背景にフェードアウト */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0e0628] to-transparent" />
        </div>
      </div>

      {/* ヘッダー テキスト */}
      <div className="relative z-10 -mt-8 pb-6 flex flex-col items-center gap-3 px-5">
        <div className="text-center">
          <h1 className="text-[28px] font-display font-medium text-knd-gold tracking-[4px]">ノア</h1>
          <p className="text-[12px] text-knd-lavender/60 tracking-[1.5px] mt-1">占い好きのフリーランス</p>
          <p className="text-[11px] text-knd-lavender/40 tracking-[1px] mt-0.5">こんにゃん堂 主宰</p>
        </div>
        <p className="text-[13px] text-[#d8d0e8] text-center leading-relaxed max-w-[320px] font-body">
          占い師じゃなくて、<span className="text-knd-gold/90">占い好きの友達</span>として話せる存在でいたい。
          タロットのこと、ちゃんと知ってるから、一緒に考えよう。
        </p>
      </div>

      {/* プロフィール */}
      <section className="relative z-10 mx-5 mb-5">
        <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-3 font-body">PROFILE</div>
        <div className="bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl overflow-hidden">
          {profileItems.map((item, i) => (
            <div
              key={i}
              className={`flex gap-4 px-4 py-3 ${i < profileItems.length - 1 ? 'border-b border-knd-lavender/8' : ''}`}
            >
              <span className="text-[11px] text-knd-lavender/50 font-body shrink-0 w-[52px] pt-0.5">{item.label}</span>
              <span className="text-[13px] text-[#d8d0e8] font-body leading-snug">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ノアのストーリー */}
      <section className="relative z-10 mx-5 mb-5">
        <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-3 font-body">STORY</div>
        <div className="space-y-2.5">
          {storyItems.map((text, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-knd-gold/40 text-[11px] font-body shrink-0 pt-0.5">✦</span>
              <p className="text-[13px] text-[#d8d0e8] font-body leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* すきなもの */}
      <section className="relative z-10 mx-5 mb-5">
        <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-3 font-body">FAVORITES</div>
        <div className="grid grid-cols-2 gap-2">
          {favorites.map((item, i) => (
            <div
              key={i}
              className="bg-knd-purple/20 border border-knd-lavender/10 rounded-xl px-3 py-2.5 flex gap-2 items-start"
            >
              <span className="text-[16px] shrink-0">{item.icon}</span>
              <span className="text-[12px] text-[#d8d0e8] font-body leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ツキのコーナー */}
      <section className="relative z-10 mx-5 mb-6">
        <div className="text-[10px] text-knd-gold/60 tracking-[3px] mb-3 font-body">TSUKI — 白猫の使い魔</div>
        <div className="bg-gradient-to-br from-[#2a1860]/40 to-[#1a0e40]/40 border border-knd-lavender/10 rounded-2xl p-4">
          <div className="flex gap-4 items-start mb-3">
            <div className="w-14 h-14 rounded-full bg-knd-gold/10 border border-knd-gold/20 flex items-center justify-center text-[28px] shrink-0">
              🐱
            </div>
            <div>
              <p className="text-[14px] text-knd-gold font-display font-medium mb-1">ツキ</p>
              <p className="text-[11px] text-knd-lavender/50 font-body">白猫（雑種）・推定3歳・瞳はうすい金色</p>
            </div>
          </div>
          <p className="text-[13px] text-[#d8d0e8] font-body leading-relaxed mb-3">
            雨の日に近所の神社で拾った子猫。月夜に拾ったから「ツキ」。
            ノアのタロット鑑定を手伝う<span className="text-knd-lavender/80">使い魔</span>的存在……らしい。
            カードの上に座るのが得意技。
          </p>
          <div className="bg-[#1a0e40]/60 rounded-xl p-3">
            <p className="text-[11px] text-knd-lavender/50 font-body mb-1 tracking-wider">ツキのひとこと</p>
            <p className="text-[13px] text-[#d8d0e8] font-body italic">
              「にゃ〜...にゃにゃ...」
            </p>
            <p className="text-[11px] text-knd-lavender/60 font-body mt-1">
              （翻訳：今日のノア、朝からいいカード引いてにやにやしてるにゃ）
            </p>
          </div>
        </div>
      </section>

      {/* CTAリンク */}
      <section className="relative z-10 mx-5 mb-4 space-y-2.5">
        <Link
          href="/chat"
          className="flex items-center justify-between w-full bg-gradient-to-r from-knd-gold/15 to-knd-purple/15 border border-knd-gold/30 rounded-2xl px-5 py-4 transition-all active:scale-95"
        >
          <div>
            <p className="text-[14px] text-knd-gold font-body font-medium">ノアに相談する</p>
            <p className="text-[11px] text-knd-lavender/50 font-body mt-0.5">占いのことでも、なんでも</p>
          </div>
          <span className="text-knd-gold/60 text-lg">›</span>
        </Link>
        <Link
          href="/tarot"
          className="flex items-center justify-between w-full bg-knd-purple/20 border border-knd-lavender/10 rounded-2xl px-5 py-4 transition-all active:scale-95"
        >
          <div>
            <p className="text-[14px] text-[#d8d0e8] font-body">タロット占いをする</p>
            <p className="text-[11px] text-knd-lavender/50 font-body mt-0.5">1枚引き・3枚スプレッド</p>
          </div>
          <span className="text-knd-lavender/40 text-lg">›</span>
        </Link>
      </section>
    </div>
  );
}
