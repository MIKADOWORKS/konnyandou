'use client';

interface UsageBadgeProps {
  usage: {
    chatCount: number;
    chatLimit: number;
    chatTickets: number;
    source: 'free' | 'ticket';
  };
}

export default function UsageBadge({ usage }: UsageBadgeProps) {
  const { chatCount, chatLimit, chatTickets, source } = usage;

  if (source === 'ticket' && chatTickets > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-knd-gold/20 border border-knd-gold/30">
        <span className="text-[10px] text-knd-gold font-bold">
          チケット {chatTickets}回
        </span>
      </div>
    );
  }

  const remaining = Math.max(0, chatLimit - chatCount);
  const isLow = remaining <= 1;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
        isLow
          ? 'bg-red-500/20 border-red-400/30'
          : 'bg-knd-purple/30 border-knd-lavender/20'
      }`}
    >
      <span
        className={`text-[10px] font-bold ${
          isLow ? 'text-red-300 animate-pulse-slow' : 'text-knd-lavender/70'
        }`}
      >
        無料 {remaining}/{chatLimit}
      </span>
    </div>
  );
}
