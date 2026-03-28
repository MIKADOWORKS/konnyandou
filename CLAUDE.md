@AGENTS.md

# こんにゃん堂 — プロジェクトガイド

## 概要
AIフレンド「ノア」と白猫の使い魔「ツキ」による占いサービス。
モバイルファースト（max-width 430px）のNext.jsアプリ。

- **本番URL**: https://konnyandou-buc7.vercel.app
- **リポジトリ**: MIKADOWORKS/konnyandou

## コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド（デプロイ前に必ず実行）
npm run lint     # ESLint
```

## 技術スタック
- Next.js 16.2.1（App Router） / React 19.2.4 / TypeScript 5
- Tailwind CSS 4（`@theme inline` でカスタムカラー定義 in globals.css）
- Anthropic Claude API（Haiku 4.5）
- Google Fonts は globals.css の `@import` で読み込み（`next/font` は使わない）

## ディレクトリ構成
```
src/app/           → ページと API ルート
src/components/    → 共有 UI コンポーネント
src/lib/           → ユーティリティ・データ・API クライアント
src/types/         → 型定義
public/images/     → 静的画像（noa-avatar.png）
.claude/rules/     → Claude Code 用の詳細ルール
```

## コーディング規約
- クライアントコンポーネントは先頭に `'use client'` を付ける
- スタイリングは Tailwind ユーティリティクラスのみ。inline style は最小限に
- カスタムカラーは `knd-*` プレフィックス（knd-indigo, knd-purple, knd-lavender, knd-gold, knd-pink）
- フォントは `font-display`（Zen Maru Gothic）と `font-body`（Noto Sans JP）を使い分ける
- アニメーションは globals.css に定義済みのクラスを使う（animate-fadeSlideIn, animate-twinkle 等）
- API ルートのエラー時はフォールバックデータを返してUIが壊れないようにする

## 環境変数
- `ANTHROPIC_API_KEY`: Claude API キー（Vercel環境変数に設定済み）

## キャラクター設定
詳細は `.claude/rules/noa-character.md` を参照。

## 今後の開発候補
- OG画像の動的生成
- PWA対応
- ツキ（白猫）のキャラクター画像
- レート制限・使用量管理
- アクセス解析
