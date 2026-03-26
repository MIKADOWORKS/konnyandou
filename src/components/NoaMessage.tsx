'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NoaMessageProps {
  message: string;
  animate?: boolean;
}

export default function NoaMessage({ message, animate = true }: NoaMessageProps) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : message);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(message);
      return;
    }
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [message, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex gap-3 items-start max-w-lg mx-auto"
    >
      <div className="shrink-0 w-12 h-12 rounded-full bg-knd-purple/30 border-2 border-knd-lavender/50 flex items-center justify-center text-2xl">
        🔮
      </div>
      <div className="bg-knd-indigo-light/80 border border-knd-purple/30 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-knd-pink">
        <p className="font-display text-xs text-knd-lavender/70 mb-1">ノア</p>
        <p className="whitespace-pre-wrap">{displayedText}</p>
      </div>
    </motion.div>
  );
}
