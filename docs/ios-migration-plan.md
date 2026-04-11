# こんにゃん堂 iOSアプリ移行計画

**作成日:** 2026-04-11  
**方針転換理由:** Stripe・PAY.JP の審査NG（「占いカテゴリ」と推定）→ App Store課金に完全移行

---

## 方針の核心

**第三者決済を一切使わず、App Store課金に完全移行する。**

| 項目 | 内容 |
|------|------|
| Apple手数料 | 売上の30% |
| ¥980サブスク実収入 | ¥686 |
| ¥800セッション実収入 | ¥560 |
| ターゲット適合 | 占い好き女性 = iPhone率が極めて高い |

---

## マネタイズ構造

| 機能 | Free | Premium（¥980/月） | プレミアムチャットセッション（¥800/回） |
|------|------|-------------------|--------------------------------------|
| 今日の運勢 | 1日1回・短め | 無制限・詳細 | — |
| タロット演出 | 1枚引きのみ | 3枚・ケルト十字 | ケルト十字（詳細） |
| ノアとの対話 | 1日2回 | 無制限 | 1回完結 |
| 相性 | — | ○ | — |
| 広告 | あり | なし | なし |

---

## Phase 1 — Webアプリ MVP（今すぐ着手）

目標：コア体験を動かせる状態にする

1. Anthropic Console でAPIキー取得
2. konnyandou.jp へのURL切り替え
3. ノアとの会話画面の実装（コア体験）
4. Claude API接続（ノア人格プロンプト）
5. カード演出画面の実装（「占い」ではなく「カード演出」として実装）
6. Framer Motion によるアニメーション演出
7. AdSense配置

### カード処理の分担

```
フロントエンド側で処理:
  - タロットカードのランダム選択
  - 正位置 / 逆位置の判定（50%確率）
  - スプレッドの配置ロジック

Claude API に送る情報:
  - 選ばれたカード名と正逆位置
  - ユーザーの質問文
  - スプレッドの種類（1枚引き / 3枚 / ケルト十字）
  - ユーザー種別（free / premium）
```

---

## Phase 2 — PWA対応

目標：iPhoneホーム画面に追加できる状態にする

1. Next.js に PWA 設定を追加（`next-pwa` または `@ducanh2912/next-pwa`）
2. iPhoneホーム画面への追加を促すUI（インストールバナー）
3. オフライン対応（基本画面のみ、APIは除く）
4. Web App Manifest の設定
5. ユーザー反応の計測（GA4 + Vercel Analytics）

---

## Phase 3 — iOSネイティブアプリ化

目標：App Store「エンターテイメント」カテゴリで公開

1. React Native / Expo でアプリ化
2. Webアプリのロジック・API呼び出しをそのまま流用
3. アプリ内課金実装
   - 月額サブスクリプション（¥980）
   - 消耗型課金（¥800/セッション）
4. App Store Connect でアプリ登録
5. App Store審査申請

### App Store申請時の厳守事項

- カテゴリ：**エンターテイメント**（占い・スピリチュアル系は絶対NG）
- 説明文・スクリーンショットに「占い」禁止
- UIの全テキストも言い換えルール適用
- Android対応は**当面しない**

---

## Phase 4 — グロース

1. SEO最適化・sitemap.xml
2. OGPシェア機能（動的生成）
3. SNS運用（TwitterクーポンDMキャンペーン）
   - フォロー＆RT者にDMでクーポンコードを配布
   - プレミアムチャットセッション（¥800相当）→ 無料
   - コード管理：DB側で独自実装

---

## 技術スタック整理

| レイヤー | Phase 1-2（Web） | Phase 3（ネイティブ） |
|---------|-----------------|---------------------|
| フロントエンド | Next.js 16 + TypeScript + Tailwind CSS v4 | React Native + Expo |
| アニメーション | Framer Motion | React Native Reanimated |
| ホスティング | Vercel | App Store |
| AIエンジン | Claude API（Anthropic） | Claude API（Anthropic） |
| 決済 | （なし・無料のみ） | App Store課金（StoreKit） |
| 広告 | Google AdSense | AdMob（要検討） |

---

## カラーパレット（全フェーズ共通）

```
Deep Indigo : #0a0620 〜 #1A1A3E（背景）
Purple      : #6B4C9A
Lavender    : #c8a8ff
Gold        : #f0d060
Warm Pink   : #e8b8c8
```

## フォント（全フェーズ共通）

- **Cinzel Decorative**（ロゴ・見出し）
- **Zen Kaku Gothic New**（本文・UI）

---

## 完了済み / TODO

### 完了済み
- [x] ドメイン取得（konnyandou.jp）
- [x] GitHubリポジトリ作成（MIKADOWORKS/konnyandou）
- [x] Vercelデプロイ（konnyandou.vercel.app）
- [x] DNS設定 → Vercel
- [x] SSL（自動取得）

### TODO（Phase 1）
- [ ] Anthropic Console APIキー取得
- [ ] konnyandou.jp への URL切り替え
- [ ] Claude API 接続（ノア人格プロンプト）
- [ ] カード演出画面実装
- [ ] フリーミアム制御ロジック
- [ ] AdSense配置

### TODO（Phase 2）
- [ ] PWA設定（manifest.json + Service Worker）
- [ ] iPhoneホーム画面追加を促すUI

### TODO（Phase 3）
- [ ] React Native / Expo プロジェクト初期化
- [ ] App Store Connect 登録
- [ ] アプリ内課金（StoreKit）実装
- [ ] App Store申請

### TODO（Phase 4）
- [ ] クーポンコード管理システム
- [ ] SNS自動投稿・キャンペーン設計
