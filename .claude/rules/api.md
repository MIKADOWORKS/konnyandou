---
paths:
  - "src/app/api/**"
  - "src/lib/claude.ts"
---

# API ルート規約

## 構造
- `src/app/api/` 配下に route.ts を配置（App Router 規約）
- POST メソッドのみ使用。GET は使わない
- リクエストボディは `await req.json()` でパース

## Claude API 呼び出し
- モデルは `claude-haiku-4-5-20251001` を使用（コスト最適化）
- API キーは `process.env.ANTHROPIC_API_KEY` から取得
- `anthropic-version: '2023-06-01'` ヘッダーを必ず付ける
- システムプロンプトにノアのキャラクター設定を含める（詳細は noa-character.md）

## エラーハンドリング
- try/catch で囲み、エラー時はフォールバックデータを返す
- zodiac API はエラー時も 200 でサンプルデータを返す（UIが壊れないように）
- tarot/chat API はエラー時 500 を返す（クライアント側でフォールバックメッセージ表示）
- `console.error` でサーバーログに記録

## 応答形式
- tarot: `{ reading: string }`
- zodiac: `{ reading: string, overall: number, categories: { label, stars }[] }`
- chat: `{ reply: string }`
