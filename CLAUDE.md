# こんにゃん堂 運用ガイド

@AGENTS.md

## プロジェクト概要
- **目的:** AI占い師「ノア」と猫の使い魔「ツキ」が鑑定するWeb占いサービス
- **技術スタック:** Next.js 16 / React 19 / Tailwind CSS v4 / Anthropic Claude API / Vercel
- **ターゲット:** 18〜30代女性（占いライト層）、手軽に無料で占いを楽しみたいユーザー
- **URL:** https://konnyandou.jp（Vercel Hobby plan）
- **GitHub:** MIKADOWORKS/konnyandou
- **コンセプト設計図:** `docs/CONCEPT.md` — note / SNS / サイト制作すべてのコンテンツの最上位設計図

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

## 現在の最重要方針（Phase 2）

詳細は `docs/phase2-proposal.md` を参照。

1. **セキュリティ基盤** — 入力バリデーション・レート制限（APIコスト暴走防止）
2. **ビジュアル完成** — OGP画像・タロットカード画像・フォント修正
3. **計測環境** — アナリティクス導入（Vercel Analytics + GA4）
4. **技術的負債解消** — URL統一・未使用コンポーネント削除・コード共通化
5. **新機能** — 数秘術・相性占い・ストリーミング対応

## 編集ルール

- **編集前にコードベースを調査せよ。読んでいないコードは決して変更するな**
