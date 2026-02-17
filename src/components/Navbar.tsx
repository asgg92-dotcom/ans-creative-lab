'use client';

import { motion } from 'framer-motion';
import { ScrambleText } from '@/components/ui/ScrambleText';

export function Navbar() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-16 px-6 bg-transparent" // 배경 투명
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center text-sm font-bold tracking-tight w-full">
        {/* 중앙 정렬을 위해 w-full 및 justify-center 추가 */}
        <span className="text-gray-900 dark:text-white">
          <ScrambleText text="Ans Kim's Creative Lab" interval={3000} />
        </span>
        <span className="text-orange-500 whitespace-pre">
          {/* 앞에 공백을 포함하여 자연스럽게 연결 */}
          <ScrambleText text=" Beta" interval={3000} />
        </span>
      </div>
    </motion.header>
  );
}
