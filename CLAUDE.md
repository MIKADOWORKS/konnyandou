@AGENTS.md

# こんにゃん堂 — プロジェクトガイド

## 概要
AIフレンド「ノア」と白猫の使い魔「ツキ」による占いサービス。
モバイルファースト（max-width 430px）のNext.jsアプリ。

**本番URL**: https://konnyandou-buc7.vercel.app
**リポジトリ**: MIKADOWORKS/konnyandou

## 技術スタック
- Next.js 16.2.1（App Router）
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4（`@theme inline` でカスタムカラー定義）
- Framer Motion（現在未使用だがdepsに残っている）
- Anthropic Claude API（Haiku 4.5）

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト（BottomTabNav含む）
│   ├── globals.css         # Tailwind + カスタムアニメーション + Google Fonts @import
│   ├── page.tsx            # ホーム: 星座占い（12星座グリッド + AI運勢）
│   ├── tarot/page.tsx      # タロット: 一枚引き / 3枚スプレッド選択式
│   ├── chat/page.tsx       # チャット: ノアとのメッセンジャー風AI対話
│   ├── history/page.tsx    # 鑑定履歴（localStorage）
│   └── api/
│       ├── tarot/route.ts        # 一枚引きAI鑑定
│       ├── tarot/spread/route.ts # 3枚スプレッドAI鑑定
│       ├── zodiac/route.ts       # 星座占いAI運勢（JSON応答）
│       └── chat/route.ts         # ノアとのチャットAPI
├── components/
│   ├── BottomTabNav.tsx      # 3タブ下部ナビ（ホーム/タロット/チャット）
│   ├── NoaAvatar.tsx         # ノアアバター（/public/images/noa-avatar.png）
│   ├── StarField.tsx         # 背景の星パーティクル（fixed）
│   ├── ConstellationDecor.tsx# 星座線SVGデコレーション
│   ├── ShareButtons.tsx      # X/LINEシェアボタン
│   ├── Header.tsx            # ※未使用（旧レイアウト）
│   ├── Footer.tsx            # ※未使用（旧レイアウト）
│   ├── HeroSection.tsx       # ※未使用（旧ホーム画面）
│   ├── TarotCard.tsx         # ※未使用（旧タロットカード）
│   ├── TarotReading.tsx      # ※未使用（旧鑑定結果表示）
│   ├── NoaMessage.tsx        # ※未使用（旧メッセージ）
│   └── TsukiAnimation.tsx    # ※未使用（旧ローディング）
├── lib/
│   ├── claude.ts        # Claude API呼び出し（getReading / getSpreadReading）
│   ├── tarot-data.ts    # 大アルカナ22枚のデータ
│   ├── zodiac-data.ts   # 12星座データ
│   ├── history.ts       # localStorage履歴管理（最大50件）
│   ├── share.ts         # X/LINEシェアURL生成
│   └── constants.ts     # サイト名・URL・カラー定数
└── types/
    └── tarot.ts         # TarotCard型定義
```

## キャラクター設定

### ノア
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- タメ口ベースで親しみやすい口調
- 決めゼリフ「こんにゃん出ましたけど〜」→ 締め「…ってことで、こんなんどう？」
- アバター画像: `/public/images/noa-avatar.png`

### ツキ
- ノアの相棒の白猫の使い魔
- 占い結果を「ツキが降ろしてきた」として伝える

## デザインシステム
- カラー: `knd-indigo`(#0a0620), `knd-purple`(#6B4C9A), `knd-lavender`(#c8a8ff), `knd-gold`(#f0d060), `knd-pink`(#e8b8c8)
- フォント: `font-display`(Zen Maru Gothic), `font-body`(Noto Sans JP)
- Google Fontsは globals.css の `@import` で読み込み
- アニメーション: fadeSlideIn, twinkle, float, cardReveal, typingDot, pulse

## 環境変数
- `ANTHROPIC_API_KEY`: Claude API キー（Vercel環境変数に設定済み）

## 未使用ファイル（削除可能）
Header.tsx, Footer.tsx, HeroSection.tsx, TarotCard.tsx, TarotReading.tsx, NoaMessage.tsx, TsukiAnimation.tsx はリデザイン前の旧コンポーネント。安全に削除可能。

## 今後の開発候補
- OG画像の動的生成（シェア時に映えるカード画像）
- PWA対応（ホーム画面に追加）
- ツキ（白猫）のキャラクター画像追加
- レート制限・使用量管理
- アクセス解析
