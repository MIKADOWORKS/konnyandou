import { TarotCard as TarotCardType } from '@/types/tarot';

export default function RevealedCard({ card, isReversed }: { card: TarotCardType; isReversed: boolean }) {
  return (
    <div
      className="w-[140px] h-[210px] bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] border-2 border-knd-gold/50 rounded-xl flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(240,208,96,0.15),0_12px_40px_rgba(60,30,120,0.5)] animate-cardReveal"
      style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }}
    >
      <div className="text-[10px] text-knd-gold/60 tracking-[2px]">
        {String(card.id).padStart(1, '0')}
      </div>
      <div className="w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle,rgba(240,208,96,0.15),transparent)] flex items-center justify-center text-[30px]">
        {card.emoji}
      </div>
      <div className="text-base text-knd-gold font-display font-medium">{card.name}</div>
      <div className="text-[9px] text-knd-lavender/50 tracking-[1.5px]">{card.nameEn}</div>
    </div>
  );
}
