'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ScrambleText } from '@/components/ui/ScrambleText';

export function ThemeSwitch() {
  const { triggerExitTransition, availableThemes, currentTheme } = useTheme();
  const pathname = usePathname();

  // 루트 페이지('/')가 아니면 렌더링하지 않음
  const isHome = pathname === '/';

  // 랜덤 테마 선택 로직
  const handleRandomTheme = () => {
    const otherThemes = availableThemes.filter(t => t !== currentTheme);
    if (otherThemes.length === 0) return;

    const randomTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    triggerExitTransition(randomTheme);
  };

  return (
    <AnimatePresence>
      {isHome && (
        <motion.div
          key="shuffle"
          className="shuffle-neon-border fixed bottom-16 left-1/2 -translate-x-1/2 z-50 inline-flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            onClick={handleRandomTheme}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-0 bg-[var(--background)] text-white text-sm font-bold hover:bg-[#141414] transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <ScrambleText text="Shuffle" interval={2000} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
