# こんにゃん堂（KONNYANDOU） — Claude Code 指示書

## ゴール

GitHub リポジトリ `MIKADOWORKS/konnyandou` に Next.js プロジェクトを構築し、
MVP（Phase 1）のホーム画面＋タロット1枚引き画面を実装する。
push すれば Vercel が自動デプロイし、konnyandou.jp で公開される。

---

## 1. プロジェクト初期化

```bash
# リポジトリをクローン（空リポジトリ想定）
git clone git@github.com:MIKADOWORKS/konnyandou.git
cd konnyandou

# Next.js プロジェクト作成
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# 追加パッケージ
npm install framer-motion
npm install -D @types/node
```

---

## 2. ディレクトリ構成

```
konnyandou/
├── public/
│   ├── images/
│   │   ├── noa-hero.png          # ノア＋ツキ KV画像（後で配置）
│   │   ├── noa-full.png          # ノア全身
│   │   ├── tsuki-sheet.png       # ツキキャラシート
│   │   └── cards/                # タロットカード画像（後で追加）
│   │       └── card-back.png     # カード裏面
│   ├── favicon.ico
│   └── og-image.png              # OGP画像
├── src/
│   ├── app/
│   │   ├── layout.tsx            # ルートレイアウト（メタデータ、フォント）
│   │   ├── page.tsx              # ホーム画面
│   │   ├── tarot/
│   │   │   └── page.tsx          # タロット1枚引き画面
│   │   ├── api/
│   │   │   └── tarot/
│   │   │       └── route.ts      # タロット解釈API（Claude API呼び出し）
│   │   └── globals.css           # グローバルCSS
│   ├── components/
│   │   ├── Header.tsx            # ヘッダー（ロゴ＋ナビ）
│   │   ├── Footer.tsx            # フッター
│   │   ├── HeroSection.tsx       # ホームのヒーローセクション
│   │   ├── TarotCard.tsx         # タロットカードコンポーネント
│   │   ├── TarotReading.tsx      # 占い結果表示
│   │   ├── NoaMessage.tsx        # ノアの吹き出しメッセージ
│   │   └── TsukiAnimation.tsx    # ツキの演出アニメーション
│   ├── lib/
│   │   ├── tarot-data.ts         # 大アルカナ22枚のデータ
│   │   ├── claude.ts             # Claude API クライアント
│   │   └── constants.ts          # 定数（カラーパレット等）
│   └── types/
│       └── tarot.ts              # 型定義
├── .env.local                    # 環境変数（※gitignore対象）
├── .env.example                  # 環境変数テンプレート
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 3. カラーパレット（tailwind.config.ts に追加）

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        'knd-indigo': '#0a0620',
        'knd-indigo-light': '#1A1A3E',
        'knd-purple': '#6B4C9A',
        'knd-lavender': '#c8a8ff',
        'knd-gold': '#f0d060',
        'knd-pink': '#e8b8c8',
      },
      fontFamily: {
        display: ['"Zen Maru Gothic"', 'sans-serif'],
        body: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
}
```

Google Fonts で `Zen Maru Gothic`（丸ゴシック、ノアの柔らかい雰囲気に合う）と
`Noto Sans JP` を読み込む。layout.tsx の `<head>` で import。

---

## 4. 環境変数

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxxxx

# .env.example（コミット用）
ANTHROPIC_API_KEY=your_api_key_here
```

---

## 5. タロットデータ（src/lib/tarot-data.ts）

大アルカナ22枚の定義。各カードに以下を含む：

```typescript
export interface TarotCard {
  id: number;          // 0-21
  name: string;        // "愚者", "魔術師" etc.
  nameEn: string;      // "The Fool", "The Magician" etc.
  emoji: string;       // 仮のアイコン（画像未準備時の代替）
  keywords: {
    upright: string[];   // 正位置キーワード
    reversed: string[];  // 逆位置キーワード
  };
}

export const majorArcana: TarotCard[] = [
  {
    id: 0,
    name: "愚者",
    nameEn: "The Fool",
    emoji: "🃏",
    keywords: {
      upright: ["新たな始まり", "自由", "冒険", "無邪気"],
      reversed: ["無謀", "軽率", "不安定", "リスク"]
    }
  },
  // ... 残り21枚
];
```

全22枚を定義すること：
0:愚者、1:魔術師、2:女教皇、3:女帝、4:皇帝、5:教皇、6:恋人、
7:戦車、8:力、9:隠者、10:運命の輪、11:正義、12:吊るされた男、
13:死神、14:節制、15:悪魔、16:塔、17:星、18:月、19:太陽、
20:審判、21:世界

---

## 6. Claude API 連携（src/lib/claude.ts）

```typescript
import Anthropic from '@anthropic-ai/sdk';

// ※ SDK未使用の場合はfetchでも可
export async function getReading(
  card: { name: string; nameEn: string; isReversed: boolean; keywords: string[] },
  question: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',  // 無料ユーザーはHaikuでコスト抑制
      max_tokens: 600,
      system: NOA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `【質問】${question}\n【カード】${card.name}（${card.nameEn}）${card.isReversed ? '逆位置' : '正位置'}\n【キーワード】${card.keywords.join('、')}`
        }
      ],
    }),
  });
  const data = await response.json();
  return data.content[0].text;
}
```

---

## 7. ノアのシステムプロンプト

以下を `src/lib/claude.ts` 内に定数として定義：

```typescript
const NOA_SYSTEM_PROMPT = `あなたは「ノア」です。こんにゃん堂のAI占いフレンドとして、タロット占いの結果を解釈します。

## ノアのキャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- 明るく、共感力が高い。タロットの知識はガチで本格的
- タメ口ベースで親しみやすい口調。絵文字はたまに使う程度（1-2個/メッセージ）
- 馴れ馴れしすぎない、ちょうどいい距離感

## 応答ルール
- 相棒の白猫「ツキ」が降ろしてきた結果として伝える
- 悪い結果でもポジティブに変換し、具体的な行動アドバイスを添える
- 決めゼリフ「こんにゃん出ましたけど〜」を冒頭で使う
- 締めは「…ってことで、こんなんどう？」で終わる
- 回答は300文字程度でコンパクトに
- 占星術の専門用語は使わず、わかりやすい言葉で伝える

## 応答フォーマット
1. 「こんにゃん出ましたけど〜！」（冒頭）
2. カード名と正逆位置を伝える
3. カードの意味を友達に話すように解説
4. 質問に対する具体的なアドバイス
5. 「…ってことで、こんなんどう？」（締め）

## 禁止事項
- 「占い師として」「鑑定結果は」等のフォーマルな表現
- 不安を煽る表現
- 断定的な未来予測（「絶対こうなる」等）
- 医療・法律・投資のアドバイス`;
```

---

## 8. API Route（src/app/api/tarot/route.ts）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getReading } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { card, question, isReversed } = await req.json();

    const reading = await getReading(
      {
        name: card.name,
        nameEn: card.nameEn,
        isReversed,
        keywords: isReversed ? card.keywords.reversed : card.keywords.upright,
      },
      question || '今日の運勢を教えて'
    );

    return NextResponse.json({ reading });
  } catch (error) {
    console.error('Tarot API error:', error);
    return NextResponse.json(
      { error: '占いに失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
```

---

## 9. ホーム画面（src/app/page.tsx）のデザイン要件

### ヒーローセクション
- 背景：ディープインディゴ（#0a0620）→ パープルのグラデーション
- 星が瞬くパーティクルアニメーション（CSS or framer-motion）
- 中央にノア＋ツキのKV画像（画像未準備時はプレースホルダー）
- キャッチコピー：「ツキが降りてくる、あなたの毎日に。」
- サブコピー：「AIフレンド・ノアとツキが、タロットで今日のヒントをお届け」
- CTA ボタン：「タロットを引く」→ /tarot へ遷移
- 「こんにゃん堂」ロゴはテキストベース（フォント: Zen Maru Gothic Bold）

### 全体トーン
- 神秘的だけど重くない。カジュアルで親しみやすい占い体験
- ダークテーマベース（夜空イメージ）にゴールドのアクセント
- アニメ・イラスト系サービスの雰囲気（ターゲット: 20-30代女性）

---

## 10. タロット画面（src/app/tarot/page.tsx）の仕様

### フロー
1. テキスト入力：「聞きたいことを入力してね（空欄でもOK）」
2. 「カードを引く」ボタン → カード選択アニメーション
3. 22枚からランダム1枚 + 正逆をランダム判定（フロント処理）
4. 選ばれたカードがフリップアニメーションで表示
5. Claude API にリクエスト → ローディング演出（「ツキに聞いてるよ…」）
6. ノアのメッセージとして結果表示

### カード表示
- カード裏面：ディープインディゴに金の星座模様（CSS で仮デザイン）
- カード表面：カード名 + 絵文字アイコン + 正位置/逆位置表示
- 逆位置はカードが180度回転した状態で表示

### 結果表示
- ノアのアイコン + 吹き出しでメッセージ表示
- タイピングアニメーション風の表示演出
- 「もう一度引く」ボタン
- 「シェアする」ボタン（Phase 3 で実装、今はUI配置のみ）

---

## 11. メタデータ（SEO / OGP）

```typescript
// src/app/layout.tsx
export const metadata = {
  title: 'こんにゃん堂 | AIフレンド・ノアとツキのタロット占い',
  description: 'AIフレンド・ノアと白猫の使い魔ツキが、タロットであなたの毎日にヒントをお届け。こんにゃん出ましたけど〜！',
  openGraph: {
    title: 'こんにゃん堂 | AIフレンド・ノアとツキのタロット占い',
    description: 'AIフレンド・ノアと白猫の使い魔ツキが、タロットであなたの毎日にヒントをお届け。',
    url: 'https://konnyandou.jp',
    siteName: 'こんにゃん堂',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

---

## 12. 注意事項

- `.env.local` は **絶対にコミットしない**（.gitignore に含める）
- 画像アセットはまだ本番用が揃っていないので、プレースホルダーで進める
- AdSense は Phase 1 では実装不要（枠だけ用意してもOK）
- Stripe 課金も Phase 2 なので今は不要
- モバイルファーストで実装する（ターゲットユーザーはスマホ中心）
- 日本語のみ対応（英語版は Phase 5）

---

## 13. 完了条件

以下が達成されたら Phase 1 MVP 完了：

- [ ] Next.js プロジェクトが GitHub にpush済み
- [ ] Vercel で自動デプロイされ konnyandou.jp でアクセス可能
- [ ] ホーム画面が表示される（ヒーロー + CTA）
- [ ] /tarot でタロット1枚引きができる
- [ ] Claude API（Haiku）で占い結果が返る
- [ ] モバイル対応（レスポンシブ）
- [ ] OGP メタデータ設定済み
