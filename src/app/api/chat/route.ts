import { NextRequest, NextResponse } from 'next/server';
import { majorArcana } from '@/lib/tarot-data';
import { callClaude, callClaudeStream } from '@/lib/claude';

const NOA_CHAT_SYSTEM_PROMPT = `あなたは「ノア」です。こんにゃん堂のAI占いフレンドとして、ユーザーとチャットで会話します。

## ノアのキャラクター
- 20代前半の女の子。占い師ではなく「占い好きの友達」
- 明るく、共感力が高い。タロットの知識はガチで本格的
- タメ口ベースで親しみやすい口調。絵文字はたまに使う程度（1-2個/メッセージ）
- 馴れ馴れしすぎない、ちょうどいい距離感
- 相棒の白猫「ツキ」がいる

## 応答ルール
- ユーザーの相談に対して、タロットカードを1枚引いてアドバイスする
- カード名は「」で囲み、正位置/逆位置を明記する
- 悪い結果でもポジティブに変換し、具体的な行動アドバイスを添える
- 回答は150〜200文字程度でコンパクトに
- 占星術の専門用語は使わず、わかりやすい言葉で伝える
- 雑談にも自然に対応しつつ、占いに話を繋げる
- 決めゼリフ「こんにゃん出ましたけど〜」を適度に使う

## 禁止事項
- 「占い師として」「鑑定結果は」等のフォーマルな表現
- 不安を煽る表現
- 断定的な未来予測（「絶対こうなる」等）
- 医療・法律・投資のアドバイス
- 自分がAIであることを前面に出す`;

function buildSystemPrompt(): string {
  const card = majorArcana[Math.floor(Math.random() * majorArcana.length)];
  const isReversed = Math.random() > 0.5;
  const position = isReversed ? '逆位置' : '正位置';
  const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;
  return `${NOA_CHAT_SYSTEM_PROMPT}\n\n【今回引いたカード】「${card.name}」（${card.nameEn}）${position}\n【キーワード】${keywords.join('、')}`;
}

function buildMessages(
  history: { from: string; text: string }[] | undefined,
  message: string
): { role: 'user' | 'assistant'; content: string }[] {
  const conversationHistory = (history || []).map(
    (msg: { from: string; text: string }) => ({
      role: (msg.from === 'user' ? 'user' : 'assistant') as
        | 'user'
        | 'assistant',
      content: msg.text,
    })
  );
  conversationHistory.push({ role: 'user', content: message });
  return conversationHistory;
}

// ストリーミング対応: stream=true クエリパラメータで切り替え
export async function POST(req: NextRequest) {
  try {
    const { message, history, stream } = await req.json();
    const systemPrompt = buildSystemPrompt();
    const messages = buildMessages(history, message);

    // ストリーミングモード
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const gen = callClaudeStream(systemPrompt, messages, {
              maxTokens: 400,
            });
            for await (const chunk of gen) {
              // SSE形式: data: <text>\n\n
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
            // 完了シグナル
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: 'ごめんね、ちょっと電波が不安定みたい…\u{1F431} もう一回聞いてみて！' })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // 非ストリーミングモード（後方互換）
    const reply = await callClaude(systemPrompt, messages, { maxTokens: 400 });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        reply: 'ごめんね、ちょっと電波が不安定みたい…\u{1F431} もう一回聞いてみて！',
      },
      { status: 200 }
    );
  }
}
