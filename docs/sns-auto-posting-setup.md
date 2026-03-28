# SNS自動投稿 セットアップガイド

## 概要

毎日の12星座運勢をClaude APIで生成し、X / Threads に自動投稿するスクリプト群。

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run horoscope` | 運勢テキスト生成のみ |
| `npm run post:daily` | 生成 → X + Threads に投稿（統合） |
| `npm run post:x` | X投稿のみ |
| `npm run post:threads` | Threads投稿のみ |

---

## Step 1: X (Twitter) API セットアップ

### 1-1. Developer Portal でアプリ作成
1. https://developer.x.com/en/portal にアクセス
2. Free tier のアカウントをセットアップ（無料）
3. 「Projects & Apps」→「+ Add App」でアプリを作成
4. App permissions を **Read and Write** に変更

### 1-2. 認証キーの取得
1. アプリ設定 → 「Keys and Tokens」タブ
2. 以下の4つを取得:
   - **API Key** (Consumer Key)
   - **API Key Secret** (Consumer Secret)
   - **Access Token**
   - **Access Token Secret**

### 1-3. 環境変数を設定
`.env.local` に追加:
```
TWITTER_API_KEY=あなたのAPI Key
TWITTER_API_SECRET=あなたのAPI Key Secret
TWITTER_ACCESS_TOKEN=あなたのAccess Token
TWITTER_ACCESS_SECRET=あなたのAccess Token Secret
```

### 1-4. テスト
```bash
# DRY RUNで投稿内容をプレビュー
npm run post:daily -- --dry-run --x-only

# 実際に投稿
npm run post:daily -- --x-only
```

---

## Step 2: Threads API セットアップ

### 2-1. Meta Developer アカウント
1. https://developers.facebook.com/ でアプリ作成
2. 「Threads API」プロダクトを追加
3. Threadsアカウントをビジネス or クリエイターアカウントに切り替え

### 2-2. アクセストークンの取得
1. Graph API Explorer で短期トークンを取得
   - スコープ: `threads_basic_access`, `threads_content_publish`
2. 長期トークンに交換（60日有効）:
   ```
   GET https://graph.threads.net/access_token?
     grant_type=th_exchange_token
     &client_secret=YOUR_SECRET
     &access_token=SHORT_LIVED_TOKEN
   ```
3. ユーザーID を確認:
   ```
   GET https://graph.threads.net/v1.0/me?access_token=YOUR_TOKEN
   ```

### 2-3. 環境変数を設定
`.env.local` に追加:
```
THREADS_ACCESS_TOKEN=あなたの長期アクセストークン
THREADS_USER_ID=あなたのユーザーID
```

### 2-4. テスト
```bash
npm run post:daily -- --dry-run --threads-only
npm run post:daily -- --threads-only
```

---

## 日常運用

### 毎日の運用フロー
```bash
# 翌日分を生成して X + Threads に投稿
npm run post:daily

# 特定日の運勢を投稿
npm run post:daily -- --date 2026-04-01

# 生成だけしてファイルに保存（投稿しない）
npm run post:daily -- --generate-only

# Xだけに投稿
npm run post:daily -- --x-only
```

### オプション一覧

| フラグ | 説明 |
|--------|------|
| `--date YYYY-MM-DD` | 指定日の運勢を生成（デフォルト: 翌日） |
| `--dry-run` | 投稿せずにプレビュー |
| `--x-only` | Xのみに投稿 |
| `--threads-only` | Threadsのみに投稿 |
| `--generate-only` | 生成のみ（投稿しない） |

### 個別スクリプトのオプション

```bash
# 運勢生成（単体）
npm run horoscope -- --date 2026-04-01           # コンソール表示
npm run horoscope -- --date 2026-04-01 --json    # JSON出力
npm run horoscope -- --date 2026-04-01 --out output/horoscope  # ファイル保存

# X投稿（単体）
npm run post:x -- output/horoscope/2026-04-01-data.json           # 投稿
npm run post:x -- output/horoscope/2026-04-01-data.json --dry-run # プレビュー
npm run post:x -- output/horoscope/2026-04-01-data.json --delay 120  # 間隔変更

# Threads投稿（単体）
npm run post:threads -- output/horoscope/2026-04-01-data.json --dry-run
```

---

## コスト

| 項目 | コスト/回 |
|------|----------|
| Claude API（Haiku） | ~$0.001（input 622 + output 1,600トークン） |
| X API Free tier | 無料（月1,500ツイートまで） |
| Threads API | 無料（日250投稿まで） |

月間コスト: Claude API ~$0.03/月（毎日実行の場合）

---

## レート制限

| プラットフォーム | 制限 | 1日の使用量 |
|----------------|------|-----------|
| X Free tier | 50ツイート/日 | 13ツイート |
| Threads | 250投稿/日 | 13投稿 |
| Claude Haiku | 制限なし（従量課金） | 1リクエスト |

---

## トラブルシューティング

### Threads トークンの期限切れ
長期トークンは60日で失効します。期限前にリフレッシュしてください:
```
GET https://graph.threads.net/refresh_access_token?
  grant_type=th_refresh_token
  &access_token=YOUR_LONG_LIVED_TOKEN
```

### X のレート制限エラー
スクリプトは429エラーを検出すると自動で中断します。
投稿間隔を広げる: `--delay 180`（180秒間隔）

### 生成テキストのバリデーションエラー
JSONパースに失敗した場合、生のレスポンスが表示されます。
`--json` で出力を確認し、プロンプトの調整が必要かもしれません。
