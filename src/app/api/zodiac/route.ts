import { NextRequest, NextResponse } from 'next/server';

const NOA_ZODIAC_SYSTEM_PROMPT = `あなたは「ノア」です。こんにゃん堂のAI占いフレンドとして、星座占いの結果を伝えます。

## ノアのキャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- 明るく、共感力が高い
- タメ口ベースで親しみやすい口調。絵文字はたまに使う程度（1-2個/メッセージ）
- 馴れ馴れしすぎない、ちょうどいい距離感

## 応答ルール
- 今日の運勢を友達に話すように伝える
- 悪い結果でもポジティブに変換し、具体的な行動アドバイスを添える
- 回答は100〜150文字程度でコンパクトに
- 占星術の専門用語は使わず、わかりやすい言葉で伝える

## 応答フォーマット
以下のJSON形式で返してください。他の文字は含めないでください。
{
  "reading": "運勢のメッセージ（100〜150文字）",
  "overall": 総合運の星の数(1-5の整数),
  "love": 恋愛運の星の数(1-5の整数),
  "work": 仕事運の星の数(1-5の整数),
  "money": 金運の星の数(1-5の整数)
}`;

export async function POST(req: NextRequest) {
  try {
    const { sign, signEn } = await req.json();

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: NOA_ZODIAC_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `【星座】${sign}（${signEn}）\n【日付】${dateStr}\n今日の運勢を教えて！`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    const parsed = JSON.parse(text);

    return NextResponse.json({
      reading: parsed.reading,
      overall: parsed.overall,
      categories: [
        { label: '恋愛運', stars: parsed.love },
        { label: '仕事運', stars: parsed.work },
        { label: '金運', stars: parsed.money },
      ],
    });
  } catch (error) {
    console.error('Zodiac API error:', error);
    return NextResponse.json(
      {
        reading: '今日は直感がさえてる日！ふと思いついたことをメモしておくと、あとで役立つかも。午後からは人との会話にヒントが隠れてるよ。',
        overall: 4,
        categories: [
          { label: '恋愛運', stars: 4 },
          { label: '仕事運', stars: 3 },
          { label: '金運', stars: 5 },
        ],
      },
      { status: 200 }
    );
  }
}
