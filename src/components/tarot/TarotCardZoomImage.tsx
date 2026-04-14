'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  cardName: string;
}

export default function TarotCardZoomImage({ src, alt, cardName }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Esc で閉じる + 背面スクロールロック
  useEffect(() => {
    if (!isZoomed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isZoomed]);

  return (
    <>
      {/* サムネイル（タップで拡大） */}
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        aria-label={`${cardName}のカードを拡大表示`}
        className="group block focus:outline-none"
      >
        <div className="relative w-[200px] aspect-[2/3] rounded-xl overflow-hidden border border-knd-gold/30 shadow-[0_0_24px_rgba(240,208,96,0.15)] bg-knd-indigo/40 transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
        </div>
        <span className="mt-2 block text-center text-[10px] text-knd-lavender/50 font-body tracking-[2px]">
          タップで拡大
        </span>
      </button>

      {/* 拡大モーダル */}
      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${cardName}の拡大表示`}
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 cursor-zoom-out animate-fadeSlideIn"
        >
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            aria-label="閉じる"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 border border-white/30 text-white text-2xl leading-none flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors z-10"
          >
            ×
          </button>

          {/* 拡大画像 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(90vw,420px)] aspect-[2/3] rounded-2xl overflow-hidden border border-knd-gold/40 shadow-[0_0_60px_rgba(240,208,96,0.25)] cursor-default"
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 430px) 90vw, 420px"
              className="object-cover"
              priority
            />
          </div>

          <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] text-white/60 font-body tracking-[2px]">
            画面外をタップで閉じる
          </p>
        </div>
      )}
    </>
  );
}
