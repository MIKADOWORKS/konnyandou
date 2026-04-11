# こんにゃん堂 運用ガイド

@AGENTS.md

## プロジェクト概要
- **目的:** AIキャラクター「ノア」と白猫の使い魔「ツキ」と会話を楽しむインタラクティブエンターテイメントアプリ
- **重要分類:** 「AIキャラクターエンターテイメント」（占いサービスではない）
- **技術スタック:** Next.js 16 / React 19 / Tailwind CSS v4 / Framer Motion / Anthropic Claude API / Vercel
- **ターゲット:** 18〜30代女性（AIキャラ・エンタメ好き、iPhone率が高い）
- **URL:** https://konnyandou.jp（Vercel Hobby plan）
- **GitHub:** MIKADOWORKS/konnyandou

## 言葉の言い換えルール（UI・審査・決済登録すべてに適用）

| ❌ 使ってはいけない言葉 | ⭕ 代わりに使う言葉 |
|---|---|
| 占い・鑑定・霊視 | エンターテイメント・体験・ストーリー |
| 占い結果 | ノアからのメッセージ |
| タロット占い | カードを使ったビジュアル演出 |
| スポット鑑定 | プレミアムチャットセッション |
| 占い師 | AIキャラクター |

- App Store申請カテゴリ：**エンターテイメント**（占い・スピリチュアル系は絶対に使わない）
- スクリーンショット・説明文・UIボタン・見出しに「占い」の文字を出さない
- 「白猫タロット」は使用禁止（既存サービスと重複）。代替：「ツキの演出」「こんにゃん堂カード」

## チーム体制

**アーキテクチャ: ディレクター中心のサブエージェント方式**

ディレクター（メインセッション）が Claude Code の Agent tool を使い、
各メンバーをサブエージェントとして直接起動する。オーナーの中継は不要。

```
オーナー
  └── ディレクター（メインセッション）
        ├── Agent tool → プロトエンジニア
        ├── Agent tool → エンジニア
        ├── Agent tool → アートディレクター
        ├── Agent tool → マーケティング
        └── Agent tool → リサーチャー
```

### サブエージェント起動ルール
- 各エージェントは起動時に CLAUDE.md + roles/guidelines.md + roles/templates.md + 自分の roles/xxx.md を読む
- 独立したタスクは並行起動（同一メッセージで複数Agent tool呼び出し）
- 依存関係があるタスクは順次実行（前のエージェントの結果を待つ）
- コード変更を伴うタスクは isolation: "worktree" を使用
- 指示には「簡潔にまとめて報告」を含め、コンテキスト消費を抑える

### 共通ドキュメント
| ファイル | 内容 |
|---------|------|
| roles/guidelines.md | 全ロール共通の行動規範・コード規約・ファイル所有権 |
| roles/templates.md | 報告フォーマット（コード変更/調査/設計/バグ修正/提案/Sprint完了） |

### ロールファイル
| 役割 | ファイル | 担当領域 |
|------|---------|---------|
| ディレクター | roles/director.md | 全体統括・意思決定・オーナー窓口 |
| プロトエンジニア | roles/proto-engineer.md | 新機能の設計・技術検証・PoC |
| エンジニア | roles/engineer.md | 実装・コード品質・セキュリティ・テスト |
| アートディレクター | roles/art-director.md | UI/UX・ビジュアル・ブランディング |
| マーケティング | roles/marketing.md | 集客・SEO・SNS・収益化 |
| リサーチャー | roles/researcher.md | 市場調査・競合分析・ユーザー調査 |
| ライター | roles/writer.md | コピーライティング・キャラボイス管理・SNS文面 |

## 共通ルール

### Next.js に関する重要注意
このプロジェクトは Next.js 16 を使用しています。APIや規約が訓練データと異なる可能性があるため、
コードを書く前に必ず `node_modules/next/dist/docs/` のガイドを確認してください。

### ファイル配置
- ソースコード: `src/`
- APIルート: `src/app/api/`
- コンポーネント: `src/components/`
- データ・ユーティリティ: `src/lib/`
- 画像素材: `public/images/`
- ドキュメント: `docs/`

### コーディング規約
- TypeScript strict mode
- Tailwind CSS v4（CSS-in-JSは使わない）
- `'use client'` は必要な場合のみ（Server Component優先）
- 入力バリデーションにはZodを使用

### ノアのキャラクター設定
ノアの性格・口調はシステムプロンプトで定義されている。
キャラ設定を変更する場合は `src/lib/prompts.ts`（集約後）を編集すること。
複数箇所での重複定義は禁止。

## 現在の最重要方針（iOSアプリ移行）

詳細は `docs/ios-migration-plan.md` を参照。

### 開発フェーズ
1. **Phase 1 — Webアプリ MVP**（今すぐ着手）— ノアとの会話・カード演出・Claude API接続
2. **Phase 2 — PWA対応** — iPhoneホーム画面追加・オフライン対応
3. **Phase 3 — iOSネイティブアプリ化** — React Native / Expo・App Store申請・アプリ内課金
4. **Phase 4 — グロース** — SEO・OGP・SNS運用・クーポンキャンペーン

### 決済方針
- Stripe / PAY.JP は使用しない（審査NG経緯あり）
- **App Store課金に完全移行**（月額¥980 / セッション¥800）
- Android対応は当面しない（iOSに集中）

### モデル・コスト設計
| ユーザー | モデル | max_tokens |
|---|---|---|
| 無料（Free） | claude-haiku-4-5 | 500 |
| 有料（Premium） | claude-sonnet-4-6 | 3000 |
| プレミアムチャットセッション（¥800） | claude-sonnet-4-6 | 4000 |

## 編集ルール

- **編集前にコードベースを調査せよ。読んでいないコードは決して変更するな**
