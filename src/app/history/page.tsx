'use client';

import { useState, useEffect } from 'react';
import { getHistory, clearHistory, formatDate, HistoryEntry } from '@/lib/history';
import StarField from '@/components/StarField';
import NoaAvatar from '@/components/NoaAvatar';

function TypeBadge({ type }: { type: HistoryEntry['type'] }) {
  const config = {
    'tarot-single': { label: '一枚引き', color: '#f0d060', bg: 'rgba(240,208,96,0.15)' },
    'tarot-spread': { label: '3枚スプレッド', color: '#c8a0e0', bg: 'rgba(180,120,255,0.15)' },
    zodiac: { label: '星座占い', color: '#a8d8ff', bg: 'rgba(168,216,255,0.15)' },
  }[type];

  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[9px] font-body"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-4 transition-all"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <TypeBadge type={entry.type} />
        <span className="text-[10px] text-knd-lavender/40 font-body">
          {formatDate(entry.timestamp)}
        </span>
      </div>

      {/* Summary */}
      {entry.type === 'tarot-single' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{entry.cardEmoji}</span>
          <span className="text-sm text-knd-gold font-display">{entry.cardName}</span>
          <span
            className="text-[10px] font-body"
            style={{ color: entry.isReversed ? '#c8a0e0' : '#f0d060' }}
          >
            {entry.isReversed ? '逆位置' : '正位置'}
          </span>
        </div>
      )}

      {entry.type === 'tarot-spread' && entry.spreadCards && (
        <div className="flex gap-3 mb-2">
          {entry.spreadCards.map((sc, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-knd-lavender/50 font-body">{sc.position}</span>
              <span className="text-lg">{sc.cardEmoji}</span>
              <span className="text-[10px] text-knd-gold/80 font-body">{sc.cardName}</span>
            </div>
          ))}
        </div>
      )}

      {entry.type === 'zodiac' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{entry.signIcon}</span>
          <span className="text-sm text-knd-gold font-display">{entry.sign}</span>
          {entry.overall && (
            <span className="text-[11px] text-knd-gold/80">
              {'★'.repeat(entry.overall)}
              {'☆'.repeat(5 - entry.overall)}
            </span>
          )}
        </div>
      )}

      {entry.question && (
        <div className="text-[11px] text-knd-lavender/50 font-body mb-2">
          Q: {entry.question}
        </div>
      )}

      {/* Reading (collapsible) */}
      <div
        className="text-[12.5px] leading-[1.7] text-[#d8d0e8] font-body overflow-hidden transition-all"
        style={{
          maxHeight: expanded ? '500px' : '3.4em',
        }}
      >
        {entry.reading}
      </div>

      {!expanded && entry.reading.length > 60 && (
        <div className="text-[10px] text-knd-lavender/40 font-body mt-1">
          タップで全文表示
        </div>
      )}
    </button>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="relative pb-24">
      <StarField />

      <div className="relative z-10 px-5">
        <div className="text-center pt-12 mb-6">
          <div className="text-[11px] text-knd-lavender/50 tracking-[4px] mb-2">
            READING HISTORY
          </div>
          <h1 className="text-[22px] font-light font-display text-knd-lavender tracking-[2px]">
            鑑定履歴
          </h1>
        </div>

        {history.length === 0 ? (
          <div className="animate-fadeSlideIn">
            <div className="flex flex-col items-center gap-4 py-12">
              <NoaAvatar size={60} />
              <div className="text-center">
                <div className="text-knd-lavender/60 text-sm font-body mb-1">
                  まだ鑑定履歴がないよ
                </div>
                <div className="text-knd-lavender/40 text-xs font-body">
                  タロットや星座占いをすると、ここに記録されるよ
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] text-knd-lavender/40 font-body">
                {history.length}件の鑑定
              </span>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[11px] text-knd-lavender/30 font-body"
                >
                  履歴を削除
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    className="text-[11px] text-red-400 font-body"
                  >
                    削除する
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[11px] text-knd-lavender/40 font-body"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {history.map((entry) => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
