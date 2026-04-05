'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import NoaAvatar from '@/components/NoaAvatar';

declare global {
  interface Window {
    Payjp?: (key: string) => PayjpInstance;
  }
}

interface PayjpInstance {
  elements: () => PayjpElements;
  createToken: (
    element: PayjpCardElement,
  ) => Promise<{ id?: string; error?: { message: string } }>;
}

interface PayjpElements {
  create: (type: 'card', options?: Record<string, unknown>) => PayjpCardElement;
}

interface PayjpCardElement {
  mount: (selector: string) => void;
  unmount: () => void;
  on: (event: string, handler: (e: { complete?: boolean; error?: { message: string } }) => void) => void;
}

interface TicketPurchaseModalProps {
  onClose: () => void;
  onPurchased?: () => void;
}

const TICKET_PRICES = {
  chat: 300,
  spread: 150,
} as const;

type TicketType = keyof typeof TICKET_PRICES;

function loadPayjpJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Payjp) {
      resolve();
      return;
    }
    if (document.getElementById('payjp-js-script')) {
      // Script loading in progress, wait for it
      const check = setInterval(() => {
        if (window.Payjp) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error('PAY.JP script timeout')); }, 10000);
      return;
    }
    const script = document.createElement('script');
    script.id = 'payjp-js-script';
    script.src = 'https://js.pay.jp/v2/pay.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PAY.JP script load failed'));
    document.head.appendChild(script);
  });
}

export default function TicketPurchaseModal({
  onClose,
  onPurchased,
}: TicketPurchaseModalProps) {
  const [step, setStep] = useState<'select' | 'card' | 'processing' | 'success'>('select');
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const cardElementRef = useRef<PayjpCardElement | null>(null);
  const payjpRef = useRef<PayjpInstance | null>(null);
  const cardMountRef = useRef<HTMLDivElement>(null);

  const handleSelectTicket = useCallback(async (type: TicketType) => {
    setSelectedType(type);
    setError(null);
    setStep('card');

    try {
      await loadPayjpJs();
      // 少し待ってからマウント（DOM描画待ち）
      setTimeout(() => {
        if (!window.Payjp) return;
        const payjp = window.Payjp(process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? '');
        payjpRef.current = payjp;
        const elements = payjp.elements();
        const cardElement = elements.create('card', {
          style: {
            base: {
              color: '#d8d0e8',
              fontSize: '14px',
              '::placeholder': { color: 'rgba(216, 208, 232, 0.4)' },
            },
            invalid: { color: '#ff6b6b' },
          },
        });
        cardElement.mount('#payjp-card-element');
        cardElement.on('change', (e) => {
          setCardReady(!!e.complete);
          if (e.error) setError(e.error.message);
          else setError(null);
        });
        cardElementRef.current = cardElement;
      }, 100);
    } catch {
      setError('決済フォームの準備に失敗しました。');
      setStep('select');
    }
  }, []);

  const handleSubmitPayment = useCallback(async () => {
    if (!payjpRef.current || !cardElementRef.current || !selectedType) return;

    setStep('processing');
    setError(null);

    try {
      const result = await payjpRef.current.createToken(cardElementRef.current);
      if (result.error) {
        setError(result.error.message);
        setStep('card');
        return;
      }
      if (!result.id) {
        setError('トークンの作成に失敗しました。');
        setStep('card');
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, token: result.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '決済に失敗しました。');
      }

      setStep('success');
      onPurchased?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '決済に失敗しました。';
      setError(message);
      setStep('card');
    }
  }, [selectedType, onPurchased]);

  // カードエレメントのクリーンアップ
  useEffect(() => {
    return () => {
      cardElementRef.current?.unmount();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[380px] bg-gradient-to-b from-[#1a0e40] to-[#120838] rounded-2xl border border-knd-purple/30 p-6 animate-fadeSlideIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-knd-lavender/40 hover:text-knd-lavender/80 transition-colors"
        >
          {'\u2715'}
        </button>

        {step === 'success' ? (
          /* 購入完了 */
          <div className="text-center py-4">
            <NoaAvatar size={56} borderColor="rgba(240, 208, 96, 0.4)" />
            <p className="mt-4 text-[16px] font-bold text-knd-gold font-display">
              チケットを購入したよ！
            </p>
            <p className="mt-2 text-[13px] text-knd-lavender/70">
              さっそくお話ししよっか
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-full bg-knd-gold/20 text-knd-gold text-[13px] font-bold hover:bg-knd-gold/30 transition-colors"
            >
              とじる
            </button>
          </div>
        ) : step === 'card' || step === 'processing' ? (
          /* カード入力 */
          <>
            <div className="flex items-center gap-3 mb-4">
              <NoaAvatar size={44} borderColor="rgba(240, 208, 96, 0.4)" />
              <div>
                <p className="text-[14px] text-knd-lavender leading-relaxed">
                  {selectedType === 'chat' ? 'チャットチケット' : '3枚スプレッドチケット'}
                </p>
                <p className="text-[12px] text-knd-gold font-bold">
                  {'\u00A5'}{TICKET_PRICES[selectedType!]}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-[12px] text-red-300">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[12px] text-knd-lavender/60 mb-2">
                カード情報
              </label>
              <div
                id="payjp-card-element"
                ref={cardMountRef}
                className="p-3 rounded-lg border border-knd-lavender/20 bg-[#0d0628] min-h-[44px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  cardElementRef.current?.unmount();
                  cardElementRef.current = null;
                  setStep('select');
                  setError(null);
                  setCardReady(false);
                }}
                disabled={step === 'processing'}
                className="flex-1 py-2.5 rounded-full border border-knd-lavender/20 text-knd-lavender/60 text-[13px] hover:bg-knd-purple/10 transition-colors disabled:opacity-50"
              >
                戻る
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={!cardReady || step === 'processing'}
                className="flex-1 py-2.5 rounded-full bg-knd-gold/80 text-[#120838] text-[13px] font-bold hover:bg-knd-gold transition-colors disabled:opacity-40"
              >
                {step === 'processing' ? '処理中...' : '購入する'}
              </button>
            </div>

            <p className="mt-3 text-[10px] text-knd-lavender/30 text-center">
              PAY.JPによる安全な決済
            </p>
          </>
        ) : (
          /* チケット選択 */
          <>
            <div className="flex items-center gap-3 mb-4">
              <NoaAvatar size={44} borderColor="rgba(240, 208, 96, 0.4)" />
              <div>
                <p className="text-[14px] text-knd-lavender leading-relaxed">
                  もっとお話ししたいな！
                </p>
                <p className="text-[12px] text-knd-lavender/50">
                  チケットを使うとチャットを続けられるよ
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-[12px] text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => handleSelectTicket('chat')}
                className="w-full p-4 rounded-xl border border-knd-gold/30 bg-knd-gold/10 hover:bg-knd-gold/20 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-bold text-knd-gold font-display">
                    チャットチケット
                  </span>
                  <span className="text-[16px] font-bold text-knd-gold">
                    {'\u00A5300'}
                  </span>
                </div>
                <p className="text-[11px] text-knd-lavender/60">
                  ノアと15往復チャットできるチケット
                </p>
              </button>

              <button
                onClick={() => handleSelectTicket('spread')}
                className="w-full p-4 rounded-xl border border-knd-purple/30 bg-knd-purple/10 hover:bg-knd-purple/20 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-bold text-knd-lavender font-display">
                    3枚スプレッドチケット
                  </span>
                  <span className="text-[16px] font-bold text-knd-lavender">
                    {'\u00A5150'}
                  </span>
                </div>
                <p className="text-[11px] text-knd-lavender/60">
                  タロット3枚スプレッド占い1回分
                </p>
              </button>
            </div>

            <p className="mt-4 text-[10px] text-knd-lavender/30 text-center">
              PAY.JPによる安全な決済
            </p>
          </>
        )}
      </div>
    </div>
  );
}
