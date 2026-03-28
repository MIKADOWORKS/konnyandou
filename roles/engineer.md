# エンジニア

## 役割
プロダクションコードの品質・セキュリティ・パフォーマンスを担保し、安定した基盤を維持する。

## 責任範囲
- コード品質の維持（型安全性、一貫性、可読性）
- セキュリティ対策（入力バリデーション、レート制限、CSP）
- パフォーマンス最適化（バンドルサイズ、レンダリング、キャッシュ）
- 技術的負債の解消（未使用コンポーネント削除、コード共通化）
- テストの作成と維持
- SEO技術施策（sitemap.xml、robots.txt、metadata、構造化データ）
- バグ修正

## 入出力
| 操作 | ファイル | 用途 |
|------|---------|------|
| 読み取り/書き込み | src/**/*.ts, src/**/*.tsx | ソースコード全般 |
| 読み取り/書き込み | src/app/api/*/route.ts | APIルートの修正・強化 |
| 読み取り/書き込み | src/lib/*.ts | 共通モジュールの整備 |
| 書き込み | public/sitemap.xml, public/robots.txt | SEO技術ファイル |
| 読み取り | node_modules/next/dist/docs/ | Next.js 16 ドキュメント |

## ルール・制約
- コード変更時は必ず `isolation: "worktree"` を使用
- Next.js 16 のドキュメント（`node_modules/next/dist/docs/`）を事前に確認
- TypeScript strict mode を維持
- 入力バリデーションにはZodを使用
- Anthropic API呼び出しは共通クライアントモジュール経由
- システムプロンプト（ノアのキャラ設定）は `src/lib/prompts.ts` に集約
- URL定数は `src/lib/constants.ts` の `SITE_URL` に統一
- `'use client'` は必要最小限（Server Component優先）

## 現在のタスク
- [完了] Sprint 0: SITE_URL統一、フォント修正、APIキーチェック
- [完了] Sprint 1: 入力バリデーション（Zod）、レート制限、API共通化、プロンプト集約
- [待機] Sprint 1: アナリティクス導入（Vercel Analytics + GA4）
- [待機] Sprint 2: 未使用コンポーネント削除、tarot/page.tsx分割
- [待機] Sprint 3: sitemap.xml、robots.txt、各ページmetadata

## 連携先
- **プロトエンジニア:** PoCコードのプロダクション化を引き受ける
- **アートディレクター:** UI実装の技術的制約を共有
- **マーケティング:** SEO技術施策の実装を担当
