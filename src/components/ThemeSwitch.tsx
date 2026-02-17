'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ScrambleText } from '@/components/ui/ScrambleText';

export function ThemeSwitch() {
  const { setTheme, availableThemes, currentTheme } = useTheme(); // currentTheme 추가
  const pathname = usePathname();

  // 루트 페이지('/')가 아니면 렌더링하지 않음
  const isHome = pathname === '/';

  // 랜덤 테마 선택 로직
  const handleRandomTheme = () => {
    // 현재 테마를 제외한 나머지 테마들
    const otherThemes = availableThemes.filter(t => t !== 'MoreComingSoon' && t !== currentTheme);
    
    if (otherThemes.length === 0) return; // 바꿀 테마가 없으면 종료

    const randomTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    setTheme(randomTheme);
  };

  return (
    <AnimatePresence>
      {isHome && (
        <motion.button
          onClick={handleRandomTheme}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-lg hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // 사라질 때 페이드아웃
          whileHover={{ y: -2 }}
        >
          <Shuffle className="w-4 h-4" />
          <span className="font-bold text-sm">
            <ScrambleText text="Shuffle" interval={2000} /> {/* 2초마다 지직거림 */}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
