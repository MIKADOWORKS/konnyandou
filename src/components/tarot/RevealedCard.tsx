import Image from 'next/image';
import { TarotCard as TarotCardType } from '@/types/tarot';

export default function RevealedCard({ card, isReversed }: { card: TarotCardType; isReversed: boolean }) {
  return (
    <div
      className="w-[140px] h-[210px] rounded-xl border-2 border-knd-gold/50 shadow-[0_0_40px_rgba(240,208,96,0.15),0_12px_40px_rgba(60,30,120,0.5)] animate-cardReveal overflow-hidden relative"
      style={{ transform: isReversed ? 'rotate(180deg)' : 'none' }}
    >
      {card.image ? (
        <>
          <Image
            src={card.image}
            alt={card.name}
            width={140}
            height={210}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2 flex flex-col items-center gap-0.5">
            <div className="text-[11px] text-knd-gold font-display font-medium">{card.name}</div>
            <div className="text-[8px] text-knd-lavender/70 tracking-[1px]">{card.nameEn}</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-[#1a0e40] via-[#2a1860] to-[#3a2080] flex flex-col items-center justify-center gap-2">
          <div className="text-[10px] text-knd-gold/60 tracking-[2px]">
            {String(card.id).padStart(2, '0')}
          </div>
          <div className="w-[60px] h-[60px] rounded-full bg-[radial-gradient(circle,rgba(240,208,96,0.15),transparent)] flex items-center justify-center text-[30px]">
            {card.emoji}
          </div>
          <div className="text-base text-knd-gold font-display font-medium">{card.name}</div>
          <div className="text-[9px] text-knd-lavender/50 tracking-[1.5px]">{card.nameEn}</div>
        </div>
      )}
    </div>
  );
}
