'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-knd-indigo/80 backdrop-blur-md border-b border-knd-purple/20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl text-knd-gold">
          こんにゃん堂
        </Link>
        <nav className="flex gap-4">
          <Link
            href="/tarot"
            className="text-sm text-knd-lavender hover:text-knd-gold transition-colors"
          >
            タロット占い
          </Link>
        </nav>
      </div>
    </header>
  );
}
