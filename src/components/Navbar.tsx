'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrambleText } from '@/components/ui/ScrambleText';

export function Navbar() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-16 px-6 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href="/"
        className="flex items-center justify-center text-sm font-bold tracking-tight w-full hover:opacity-90 transition-opacity"
      >
        <span className="text-white">
          <ScrambleText text="Ans Kim's Creative Lab" interval={3000} />
        </span>
        <span className="text-orange-500 whitespace-pre">
          <ScrambleText text=" Beta" interval={3000} />
        </span>
      </Link>
    </motion.header>
  );
}
