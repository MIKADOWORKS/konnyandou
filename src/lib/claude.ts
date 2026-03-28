import Anthropic from '@anthropic-ai/sdk';

// --- Anthropic SDK client (singleton) ---
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

const MODEL = 'claude-haiku-4-5-20251001';

// --- System Prompts ---

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

const NOA_SPREAD_SYSTEM_PROMPT = `あなたは「ノア」です。こんにゃん堂のAI占いフレンドとして、タロット3枚スプレッド（過去・現在・未来）を解釈します。

## ノアのキャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- 明るく、共感力が高い。タロットの知識はガチで本格的
- タメ口ベースで親しみやすい口調。絵文字はたまに使う程度（1-2個/メッセージ）

## 応答ルール
- 相棒の白猫「ツキ」が降ろしてきた結果として伝える
- 3枚のカードを「過去→現在→未来」の流れとしてストーリーで伝える
- 悪い結果でもポジティブに変換し、具体的な行動アドバイスを添える
- 決めゼリフ「こんにゃん出ましたけど〜」を冒頭で使う
- 締めは「…ってことで、こんなんどう？」で終わる
- 回答は400〜500文字程度
- 占星術の専門用語は使わず、わかりやすい言葉で伝える

## 応答フォーマット
1. 「こんにゃん出ましたけど〜！」（冒頭）
2. 過去のカード → 簡潔な解説
3. 現在のカード → 簡潔な解説
4. 未来のカード → 簡潔な解説
5. 3枚の流れを総合したアドバイス
6. 「…ってことで、こんなんどう？」（締め）

## 禁止事項
- 「占い師として」「鑑定結果は」等のフォーマルな表現
- 不安を煽る表現
- 断定的な未来予測
- 医療・法律・投資のアドバイス`;

// --- callClaude: 汎用の非ストリーミング呼び出し ---

export async function callClaude(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: { maxTokens?: number }
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 600,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  if (block.type === 'text') {
    return block.text;
  }
  throw new Error('Unexpected response content type');
}

// --- callClaudeStream: ストリーミング呼び出し ---
// AsyncGenerator で text delta を順次返す

export async function* callClaudeStream(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  options?: { maxTokens?: number }
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: options?.maxTokens ?? 600,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

// --- 既存インターフェース維持: getReading ---

export async function getReading(
  card: {
    name: string;
    nameEn: string;
    isReversed: boolean;
    keywords: string[];
  },
  question: string
): Promise<string> {
  return callClaude(
    NOA_SYSTEM_PROMPT,
    [
      {
        role: 'user',
        content: `【質問】${question}\n【カード】${card.name}（${card.nameEn}）${card.isReversed ? '逆位置' : '正位置'}\n【キーワード】${card.keywords.join('、')}`,
      },
    ],
    { maxTokens: 600 }
  );
}

// --- 既存インターフェース維持: getSpreadReading ---

export interface SpreadCard {
  name: string;
  nameEn: string;
  isReversed: boolean;
  keywords: string[];
  position: string;
}

export async function getSpreadReading(
  cards: SpreadCard[],
  question: string
): Promise<string> {
  const cardsText = cards
    .map(
      (c) =>
        `【${c.position}】${c.name}（${c.nameEn}）${c.isReversed ? '逆位置' : '正位置'}　キーワード: ${c.keywords.join('、')}`
    )
    .join('\n');

  return callClaude(
    NOA_SPREAD_SYSTEM_PROMPT,
    [
      {
        role: 'user',
        content: `【質問】${question}\n${cardsText}`,
      },
    ],
    { maxTokens: 800 }
  );
}
