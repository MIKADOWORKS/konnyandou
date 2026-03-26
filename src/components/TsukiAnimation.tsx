'use client';

import { motion } from 'framer-motion';

interface TsukiAnimationProps {
  isLoading?: boolean;
}

export default function TsukiAnimation({ isLoading = false }: TsukiAnimationProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <div className="text-4xl animate-float">🐱</div>
      {isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-knd-lavender text-sm font-display"
        >
          ツキに聞いてるよ…
        </motion.p>
      )}
    </motion.div>
  );
}
