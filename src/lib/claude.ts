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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: NOA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `【質問】${question}\n【カード】${card.name}（${card.nameEn}）${card.isReversed ? '逆位置' : '正位置'}\n【キーワード】${card.keywords.join('、')}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
