'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: '/', label: 'ホーム', icon: '☽' },
  { id: '/tarot', label: 'タロット', icon: '✦' },
  { id: '/numerology', label: '数秘術', icon: '🔢' },
  { id: '/compatibility', label: '相性', icon: '💕' },
  { id: '/chat', label: 'ノアに相談', icon: '💬' },
] as const;

export default function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex bg-[rgba(15,10,40,0.95)] backdrop-blur-[20px] border-t border-knd-lavender/15 z-[100] pb-[env(safe-area-inset-bottom,8px)] pt-1.5">
      {tabs.map((t) => {
        const isActive = t.id === '/' ? pathname === '/' : pathname.startsWith(t.id);
        return (
          <Link
            key={t.id}
            href={t.id}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors"
            style={{ color: isActive ? '#f0d060' : 'rgba(200, 190, 230, 0.5)' }}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] tracking-wider font-body">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
