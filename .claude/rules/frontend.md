---
paths:
  - "src/components/**"
  - "src/app/**/page.tsx"
---

# フロントエンド規約

## コンポーネント構造
- 1ファイル1エクスポート。ファイル名とコンポーネント名を一致させる
- Props は interface で定義。`type` ではなく `interface` を使う
- `'use client'` はイベントハンドラ・useState・useEffect を使うコンポーネントのみ

## Tailwind CSS
- カスタムカラーは `knd-*` プレフィックスを使う（globals.css の @theme inline で定義済み）
- 透明度は `/` 記法を使う（例: `text-knd-lavender/60`）
- レスポンシブは不要（max-width 430px のモバイル専用）
- 細かいサイズ指定は `text-[13.5px]` のような arbitrary values を使う

## アニメーション
- globals.css に定義済みのクラスを優先的に使う:
  - `animate-fadeSlideIn` — フェードイン + 下からスライド
  - `animate-twinkle` — 星の瞬き
  - `animate-float` — 浮遊
  - `animate-cardReveal` — カードめくり
  - `animate-pulse-slow` — ゆっくり明滅
- 遅延は `style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}` で指定

## 共通コンポーネント
- `NoaAvatar` — ノアのアバター。size と borderColor を props で調整
- `StarField` — 背景の星。fixed で全画面に表示される
- `ConstellationDecor` — 星座線のSVG装飾
- `ShareButtons` — X/LINE シェアボタン
- `BottomTabNav` — 3タブナビ（layout.tsx に配置済み）
