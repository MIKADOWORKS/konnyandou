'use client';

import { useState, useCallback } from 'react';
import NoaAvatar from '@/components/NoaAvatar';

interface RedeemCodeModalProps {
  onClose: () => void;
  onRedeemed: (chatTurns: number, spreadCount: number) => void;
}

export default function RedeemCodeModal({ onClose, onRedeemed }: RedeemCodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<{ chatTurns: number; spreadCount: number } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'コードを使用できませんでした。');
        return;
      }

      setSuccess({ chatTurns: data.chatTurns ?? 0, spreadCount: data.spreadCount ?? 0 });
      onRedeemed(data.chatTurns ?? 0, data.spreadCount ?? 0);
    } catch {
      setError('通信エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [code, isLoading, onRedeemed]);

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

        {success ? (
          /* 使用完了 */
          <div className="text-center py-4">
            <NoaAvatar size={56} borderColor="rgba(240, 208, 96, 0.4)" />
            <p className="mt-4 text-[16px] font-bold text-knd-gold font-display">
              チケットを受け取ったよ！
            </p>
            <p className="mt-2 text-[13px] text-knd-lavender/70">
              {success.chatTurns > 0 && `チャット ${success.chatTurns}回分`}
              {success.chatTurns > 0 && success.spreadCount > 0 && ' / '}
              {success.spreadCount > 0 && `スプレッド ${success.spreadCount}回分`}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-full bg-knd-gold/20 text-knd-gold text-[13px] font-bold hover:bg-knd-gold/30 transition-colors"
            >
              とじる
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <NoaAvatar size={44} borderColor="rgba(140, 100, 220, 0.4)" />
              <div>
                <p className="text-[14px] text-knd-lavender leading-relaxed">
                  コードを入力してね
                </p>
                <p className="text-[12px] text-knd-lavender/50">
                  noteで購入したチケットコード
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-[12px] text-red-300">{error}</p>
              </div>
            )}

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="KND-XXXX-XXXX"
              className="w-full px-4 py-3 bg-[#0d0628] border border-knd-lavender/20 rounded-xl text-knd-lavender text-[14px] font-mono tracking-widest outline-none focus:border-knd-lavender/40 placeholder:text-knd-lavender/20 placeholder:tracking-normal mb-4"
              autoCapitalize="characters"
              spellCheck={false}
            />

            <button
              onClick={handleSubmit}
              disabled={!code.trim() || isLoading}
              className="w-full py-3 rounded-full bg-knd-gold/80 text-[#120838] text-[13px] font-bold hover:bg-knd-gold transition-colors disabled:opacity-40"
            >
              {isLoading ? '確認中...' : 'チケットを受け取る'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
