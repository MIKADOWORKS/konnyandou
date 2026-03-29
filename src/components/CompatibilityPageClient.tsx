'use client';

import { useState } from 'react';
import { ZODIAC, ZodiacSign } from '@/lib/zodiac-data';
import { saveToHistory } from '@/lib/history';
import { buildCompatibilityShareText, buildCompatibilityShareUrl } from '@/lib/share';
import StarField from '@/components/StarField';
import LoadingIndicator from '@/components/tarot/LoadingIndicator';
import ReadingBubble from '@/components/tarot/ReadingBubble';
import ShareButtons from '@/components/ShareButtons';

interface CompatibilityResult {
  reading: string;
  score: number;
  categories: { label: string; stars: number }[];
}

interface PersonInput {
  name: string;
  sign: ZodiacSign | null;
}

type Phase = 'input' | 'loading' | 'result';

function SignGrid({
  selected,
  onSelect,
}: {
  selected: ZodiacSign | null;
  onSelect: (sign: ZodiacSign) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ZODIAC.map((z) => {
        const isSelected = selected?.en === z.en;
        return (
          <button
            key={z.en}
            onClick={() => onSelect(z)}
            className="flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border transition-all"
            style={{
              background: isSelected ? 'rgba(240, 208, 96, 0.15)' : 'rgba(200, 168, 255, 0.05)',
              borderColor: isSelected ? 'rgba(240, 208, 96, 0.5)' : 'rgba(200, 168, 255, 0.15)',
            }}
          >
            <span className="text-xl">{z.icon}</span>
            <span
              className="text-[10px] font-body"
              style={{ color: isSelected ? '#f0d060' : 'rgba(200, 168, 255, 0.7)' }}
            >
              {z.sign}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 80 ? '#f0d060' : score >= 60 ? '#f4a8c8' : '#c8a8ff';
  return (
    <div className="flex flex-col items-center py-6">
      <div className="text-[11px] text-knd-lavender/50 tracking-[3px] mb-2 font-body">
        相性スコア
      </div>
      <div
        className="text-[72px] font-bold leading-none"
        style={{ color, textShadow: `0 0 40px ${color}40` }}
      >
        {score}
      </div>
      <div className="text-[16px] text-knd-lavender/50 font-body mt-1">点</div>
    </div>
  );
}

function CategoryStars({ categories }: { categories: { label: string; stars: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat) => (
        <div key={cat.label} className="flex items-center justify-between">
          <span className="text-[13px] text-knd-lavender/70 font-body">{cat.label}</span>
          <span className="text-[16px] tracking-wider">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{ color: i < cat.stars ? '#f0d060' : 'rgba(200, 168, 255, 0.2)' }}
              >
                ★
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CompatibilityPageClient() {
  const [phase, setPhase] = useState<Phase>('input');
  const [person1, setPerson1] = useState<PersonInput>({ name: '', sign: null });
  const [person2, setPerson2] = useState<PersonInput>({ name: '', sign: null });
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const canSubmit = person1.sign !== null && person2.sign !== null;

  const handleSubmit = async () => {
    if (!canSubmit || !person1.sign || !person2.sign) return;
    setPhase('loading');

    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1Name: person1.name || undefined,
          person1Sign: person1.sign.en.toLowerCase(),
          person2Name: person2.name || undefined,
          person2Sign: person2.sign.en.toLowerCase(),
        }),
      });
      const data: CompatibilityResult = await res.json();
      setResult(data);
      setPhase('result');

      saveToHistory({
        type: 'compatibility',
        reading: data.reading,
        person1Name: person1.name || undefined,
        person1Sign: person1.sign.sign,
        person2Name: person2.name || undefined,
        person2Sign: person2.sign.sign,
        score: data.score,
        categories: data.categories,
      });
    } catch {
      setPhase('input');
    }
  };

  const handleReset = () => {
    setPhase('input');
    setResult(null);
  };

  const getShareData = () => {
    if (!result || !person1.sign || !person2.sign) return null;
    const i1 = person1.sign.icon;
    const i2 = person2.sign.icon;
    const s1 = person1.sign.sign;
    const s2 = person2.sign.sign;
    const p1 = person1.name;
    const p2 = person2.name;
    const shareText = buildCompatibilityShareText(p1, s1, i1, p2, s2, i2, result.score, result.reading);
    const shareUrl = buildCompatibilityShareUrl(p1, s1, i1, p2, s2, i2, result.score);
    return { shareText, shareUrl };
  };

  return (
    <div className="relative pb-24">
      <StarField />
      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 text-center mb-8">
          <div className="text-[11px] text-knd-lavender/50 tracking-[4px] mb-2 font-body">
            COMPATIBILITY
          </div>
          <h1 className="text-[24px] font-light font-display text-knd-lavender tracking-[2px]">
            💕 相性占い
          </h1>
          <p className="text-[12px] text-knd-lavender/50 font-body mt-2">
            2人の星座で相性を占うよ
          </p>
        </div>

        {/* Input phase */}
        {phase === 'input' && (
          <div className="animate-fadeSlideIn space-y-6">
            {/* Person 1 */}
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-4">
              <div className="text-[11px] text-knd-lavender/50 tracking-[2px] mb-3 font-body">
                1人目
              </div>
              <input
                type="text"
                placeholder="あなたの名前（任意）"
                value={person1.name}
                onChange={(e) => setPerson1((p) => ({ ...p, name: e.target.value.slice(0, 20) }))}
                className="w-full bg-transparent border-b border-knd-lavender/20 text-knd-lavender text-[14px] font-body pb-2 mb-4 outline-none placeholder:text-knd-lavender/30 focus:border-knd-lavender/50 transition-colors"
              />
              <div className="text-[11px] text-knd-lavender/40 font-body mb-2">星座を選んでね</div>
              <SignGrid
                selected={person1.sign}
                onSelect={(sign) => setPerson1((p) => ({ ...p, sign }))}
              />
            </div>

            {/* Person 2 */}
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-4">
              <div className="text-[11px] text-knd-lavender/50 tracking-[2px] mb-3 font-body">
                2人目
              </div>
              <input
                type="text"
                placeholder="相手の名前（任意）"
                value={person2.name}
                onChange={(e) => setPerson2((p) => ({ ...p, name: e.target.value.slice(0, 20) }))}
                className="w-full bg-transparent border-b border-knd-lavender/20 text-knd-lavender text-[14px] font-body pb-2 mb-4 outline-none placeholder:text-knd-lavender/30 focus:border-knd-lavender/50 transition-colors"
              />
              <div className="text-[11px] text-knd-lavender/40 font-body mb-2">星座を選んでね</div>
              <SignGrid
                selected={person2.sign}
                onSelect={(sign) => setPerson2((p) => ({ ...p, sign }))}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl text-[15px] font-body tracking-[2px] transition-all"
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, rgba(244,168,200,0.3), rgba(200,168,255,0.3))'
                  : 'rgba(200, 168, 255, 0.08)',
                border: canSubmit
                  ? '1px solid rgba(244, 168, 200, 0.4)'
                  : '1px solid rgba(200, 168, 255, 0.1)',
                color: canSubmit ? '#f4a8c8' : 'rgba(200, 168, 255, 0.3)',
              }}
            >
              💕 占う
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
        {phase === 'result' && result && person1.sign && person2.sign && (
          <div className="animate-fadeSlideIn space-y-5">
            {/* Pair display */}
            <div className="flex items-center justify-center gap-4 bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-5">
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">{person1.sign.icon}</span>
                <span className="text-[13px] text-knd-gold font-body">{person1.sign.sign}</span>
                {person1.name && (
                  <span className="text-[11px] text-knd-lavender/50 font-body">{person1.name}</span>
                )}
              </div>
              <span className="text-[24px] text-knd-lavender/30">×</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">{person2.sign.icon}</span>
                <span className="text-[13px] text-knd-gold font-body">{person2.sign.sign}</span>
                {person2.name && (
                  <span className="text-[11px] text-knd-lavender/50 font-body">{person2.name}</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl">
              <ScoreDisplay score={result.score} />
            </div>

            {/* Categories */}
            <div className="bg-knd-purple/20 border border-knd-lavender/15 rounded-2xl p-4">
              <CategoryStars categories={result.categories} />
            </div>

            {/* Reading */}
            <ReadingBubble reading={result.reading} />

            {/* Share */}
            {(() => {
              const share = getShareData();
              return share ? (
                <ShareButtons text={share.shareText} url={share.shareUrl} />
              ) : null;
            })()}

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
