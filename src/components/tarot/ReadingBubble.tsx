import NoaAvatar from '@/components/NoaAvatar';

export default function ReadingBubble({ reading }: { reading: string }) {
  return (
    <div className="flex gap-3 items-start bg-knd-purple/30 border border-knd-lavender/15 rounded-2xl p-4">
      <NoaAvatar size={40} borderColor="rgba(240, 208, 96, 0.3)" />
      <div>
        <div className="text-[11px] text-knd-gold font-body mb-1.5">ノアの解釈</div>
        <div className="text-[13.5px] leading-[1.8] text-[#d8d0e8] font-body whitespace-pre-wrap">
          {reading}
        </div>
      </div>
    </div>
  );
}
