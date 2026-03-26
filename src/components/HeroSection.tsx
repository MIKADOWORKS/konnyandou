'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import StarField from './StarField';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-knd-indigo via-knd-indigo-light to-knd-indigo">
      <StarField />

      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-6">
        {/* プレースホルダー: ノア＋ツキ KV画像 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-48 h-48 rounded-full bg-knd-purple/20 border-2 border-knd-lavender/30 flex items-center justify-center"
        >
          <span className="text-6xl">🔮🐱</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display font-bold text-3xl md:text-4xl text-knd-gold leading-snug"
        >
          ツキが降りてくる、
          <br />
          あなたの毎日に。
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-knd-lavender/80 text-sm md:text-base max-w-md"
        >
          AIフレンド・ノアとツキが、タロットで今日のヒントをお届け
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Link
            href="/tarot"
            className="inline-block bg-gradient-to-r from-knd-purple to-knd-lavender text-white font-display font-bold px-8 py-3 rounded-full text-lg shadow-lg shadow-knd-purple/30 hover:shadow-knd-purple/50 hover:scale-105 transition-all"
          >
            タロットを引く ✨
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
