'use client';

import { useState } from 'react';
import { saveToHistory } from '@/lib/history';
import StarField from '@/components/StarField';
import LoadingIndicator from '@/components/tarot/LoadingIndicator';
import ReadingBubble from '@/components/tarot/ReadingBubble';
import ShareButtons from '@/components/ShareButtons';
import { SITE_URL } from '@/lib/constants';

interface NumerologyResult {
  lifePathNumber: number;
  keyword: string;
  reading: string;
}

type Phase = 'input' | 'loading' | 'result';

function buildNumerologyShareText(lifePathNumber: number, keyword: string, reading: string): string {
  const shortReading = reading.length > 80 ? reading.slice(0, 80) + '…' : reading;
  return `🔢 私のライフパスナンバーは「${lifePathNumber}」！キーワード：${keyword}\n\n${shortReading}\n\n#こんにゃん堂 #数秘術`;
}

function buildNumerologyShareUrl(lifePathNumber: number): string {
  return `${SITE_URL}/share?type=numerology&num=${lifePathNumber}`;
}

export default function NumerologyPageClient() {
  const [phase, setPhase] = useState<Phase>('input');
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const canSubmit = birthdate.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPhase('loading');

    try {
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthdate }),
      });
      const data: NumerologyResult = await res.json();
      setResult(data);
      setPhase('result');

      saveToHistory({
        type: 'numerology',
        reading: data.reading,
        lifePathNumber: data.lifePathNumber,
        keyword: data.keyword,
      });
    } catch {
      setPhase('input');
    }
  };

  const handleReset = () => {
    setPhase('input');
    setResult(null);
  };

  return (
    <div className="relative pb-24">
      <StarField />
      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 text-center mb-8">
          <div className="text-[11px] text-knd-lavender/50 tracking-[4px] mb-2 font-body">
            NUMEROLOGY
          </div>
          <h1 className="text-[24px] font-light font-display text-knd-lavender tracking-[2px]">
            🔢 数秘術占い
          </h1>
          <p className="text-[12px] text-knd-lavender/50 font-body mt-2">
            生年月日からライフパスナンバーを読み解くよ
          </p>
        </div>

        {/* Input phase */}
        {phase === 'input' && (
          <div className="animate-fadeSlideIn space-y-6">
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-4">
              <div className="text-[11px] text-knd-lavender/50 tracking-[2px] mb-3 font-body">
                生年月日を入力してね
              </div>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                min="1900-01-01"
                max={today}
                className="w-full bg-transparent border-b border-knd-lavender/20 text-knd-lavender text-[14px] font-body pb-2 outline-none focus:border-knd-lavender/50 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl text-[15px] font-body tracking-[2px] transition-all"
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, rgba(200,168,255,0.3), rgba(168,216,255,0.3))'
                  : 'rgba(200, 168, 255, 0.08)',
                border: canSubmit
                  ? '1px solid rgba(200, 168, 255, 0.4)'
                  : '1px solid rgba(200, 168, 255, 0.1)',
                color: canSubmit ? '#c8a8ff' : 'rgba(200, 168, 255, 0.3)',
              }}
            >
              🔢 占う
            </button>
          </div>
        )}

        {/* Loading phase */}
        {phase === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <LoadingIndicator />
          </div>
        )}

        {/* Result phase */}
        {phase === 'result' && result && (
          <div className="animate-fadeSlideIn space-y-5">
            {/* Life path number display */}
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-6 flex flex-col items-center">
              <div className="text-[11px] text-knd-lavender/50 tracking-[3px] mb-2 font-body">
                ライフパスナンバー
              </div>
              <div
                className="text-[80px] font-bold leading-none"
                style={{
                  color: '#c8a8ff',
                  textShadow: '0 0 40px rgba(200,168,255,0.4)',
                }}
              >
                {result.lifePathNumber}
              </div>
              <div
                className="text-[16px] font-body mt-3 tracking-wider"
                style={{ color: '#f0d060' }}
              >
                {result.keyword}
              </div>
            </div>

            {/* Reading */}
            <ReadingBubble reading={result.reading} />

            {/* Share */}
            <ShareButtons
              text={buildNumerologyShareText(result.lifePathNumber, result.keyword, result.reading)}
              url={buildNumerologyShareUrl(result.lifePathNumber)}
            />

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full py-3.5 rounded-2xl text-[13px] font-body text-knd-lavender/50 border border-knd-lavender/15 transition-all hover:border-knd-lavender/30 hover:text-knd-lavender/70"
            >
              もう一度占う
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
