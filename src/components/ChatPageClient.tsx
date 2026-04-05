'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import NoaAvatar from '@/components/NoaAvatar';
import UsageBadge from '@/components/UsageBadge';
import TicketPurchaseModal from '@/components/TicketPurchaseModal';

interface Message {
  from: 'noa' | 'user';
  text: string;
}

interface UsageState {
  chatCount: number;
  chatLimit: number;
  chatTickets: number;
  source: 'free' | 'ticket';
}

export default function ChatPageClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'noa',
      text: 'ねえねえ、何か気になることある？ 恋愛でも仕事でも、なんでも聞いてね！カード引いてあげるよ\u2728',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [usage, setUsage] = useState<UsageState>({
    chatCount: 0,
    chatLimit: 3,
    chatTickets: 0,
    source: 'free',
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 初回マウント時に使用量を取得
  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        setUsage({
          chatCount: data.chatCount ?? 0,
          chatLimit: data.chatLimit ?? 3,
          chatTickets: data.chatTickets ?? 0,
          source: (data.chatCount ?? 0) >= (data.chatLimit ?? 3) ? 'ticket' : 'free',
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setIsTyping(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-10),
          stream: true,
        }),
      });

      // 使用量制限に達した場合
      if (res.status === 429) {
        const errorData = await res.json();
        if (errorData.error === 'limit_reached') {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { from: 'noa', text: errorData.message },
          ]);
          setShowPurchaseModal(true);
          return;
        }
        throw new Error('Rate limited');
      }

      if (!res.ok) throw new Error('API error');

      // レスポンスヘッダーから残回数を取得
      const remaining = res.headers.get('X-Chat-Remaining');
      const source = res.headers.get('X-Chat-Source') as 'free' | 'ticket' | null;
      if (remaining !== null && source) {
        setUsage((prev) => ({
          ...prev,
          chatCount: source === 'free' ? prev.chatLimit - Number(remaining) : prev.chatCount,
          chatTickets: source === 'ticket' ? Number(remaining) : prev.chatTickets,
          source,
        }));
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          if (data === '[DONE]') {
            const finalText = accumulated;
            setIsTyping(false);
            setStreamingText('');
            setMessages((prev) => [
              ...prev,
              { from: 'noa', text: finalText },
            ]);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setIsTyping(false);
              setStreamingText('');
              setMessages((prev) => [
                ...prev,
                { from: 'noa', text: parsed.error },
              ]);
              return;
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingText(accumulated);
            }
          } catch {
            // JSON parse error - skip
          }
        }
      }

      if (accumulated) {
        setIsTyping(false);
        setStreamingText('');
        setMessages((prev) => [
          ...prev,
          { from: 'noa', text: accumulated },
        ]);
      } else {
        throw new Error('Empty response');
      }
    } catch {
      setIsTyping(false);
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        {
          from: 'noa',
          text: 'ごめんね、ちょっと電波が不安定みたい…\u{1F431} もう一回聞いてみて！',
        },
      ]);
    }
  }, [input, isTyping, messages]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-[72px] z-20 flex flex-col w-full max-w-[430px] mx-auto overflow-hidden bg-gradient-to-b from-knd-indigo via-[#120838] to-[#0e0628]">
      {/* Chat header */}
      <div className="pt-12 px-5 pb-3.5 bg-[rgba(15,10,40,0.9)] backdrop-blur-[20px] border-b border-knd-lavender/10 flex items-center gap-3">
        <NoaAvatar size={38} borderColor="rgba(240, 208, 96, 0.3)" />
        <div className="flex-1">
          <div className="text-[15px] text-knd-lavender font-display font-medium">
            Noa
          </div>
          <div className="text-[10px] text-knd-lavender/40">
            {isTyping ? '\u{270D}\uFE0F 入力中...' : '\u25CF オンライン'}
          </div>
        </div>
        <UsageBadge usage={usage} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[80px] flex flex-col gap-3.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex items-end gap-2 animate-fadeSlideIn"
            style={{
              flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {msg.from === 'noa' && (
              <NoaAvatar size={32} borderColor="rgba(240, 208, 96, 0.2)" />
            )}
            <div
              className="max-w-[75%] px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-[#d8d0e8] font-body whitespace-pre-wrap border"
              style={{
                borderRadius:
                  msg.from === 'user'
                    ? '14px 14px 4px 14px'
                    : '4px 14px 14px 14px',
                background:
                  msg.from === 'user'
                    ? 'linear-gradient(135deg, rgba(100, 60, 180, 0.5), rgba(80, 40, 160, 0.5))'
                    : 'rgba(40, 25, 80, 0.6)',
                borderColor:
                  msg.from === 'user'
                    ? 'rgba(140, 100, 220, 0.3)'
                    : 'rgba(180, 150, 255, 0.1)',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* ストリーミング中のメッセージ表示 */}
        {isTyping && streamingText && (
          <div className="flex items-end gap-2 animate-fadeSlideIn">
            <NoaAvatar size={32} borderColor="rgba(240, 208, 96, 0.2)" />
            <div
              className="max-w-[75%] px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-[#d8d0e8] font-body whitespace-pre-wrap border"
              style={{
                borderRadius: '4px 14px 14px 14px',
                background: 'rgba(40, 25, 80, 0.6)',
                borderColor: 'rgba(180, 150, 255, 0.1)',
              }}
            >
              {streamingText}
            </div>
          </div>
        )}

        {/* タイピングインジケータ（テキストがまだ来ていない時） */}
        {isTyping && !streamingText && (
          <div className="flex items-end gap-2">
            <NoaAvatar size={32} borderColor="rgba(240, 208, 96, 0.2)" />
            <div className="px-4.5 py-2.5 rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px] rounded-tl bg-[rgba(40,25,80,0.6)] border border-knd-lavender/10 flex gap-[5px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-knd-lavender"
                  style={{
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-3 py-2.5 bg-[rgba(15,10,40,0.95)] border-t border-knd-lavender/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ノアに相談する..."
          className="flex-1 px-4 py-2.5 bg-knd-purple/30 border border-knd-lavender/15 rounded-full text-[#d8d0e8] text-[13.5px] font-body outline-none focus:border-knd-lavender/30"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] transition-all"
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, #f0d060, #c8a030)'
              : 'rgba(40, 25, 80, 0.5)',
            color: input.trim() ? '#1a0e40' : 'rgba(200, 180, 255, 0.3)',
            cursor: input.trim() ? 'pointer' : 'default',
          }}
        >
          {'\u2191'}
        </button>
      </div>

      {/* チケット購入モーダル（決済が有効な場合のみ） */}
      {showPurchaseModal && process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true' && (
        <TicketPurchaseModal onClose={() => setShowPurchaseModal(false)} />
      )}
    </div>
  );
}
