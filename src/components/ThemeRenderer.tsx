// src/components/ThemeRenderer.tsx
'use client';

import { useTheme } from '@/context/ThemeContext';
import { LinkItem } from '@/data/links';
import { FallingText } from '@/components/themes/FallingText';
import { FallingShapes } from '@/components/themes/FallingShapes'; // 추가
import { motion, AnimatePresence } from 'framer-motion';

// ... (생략)

export function ThemeRenderer({ links }: ThemeRendererProps) {
  const { currentTheme } = useTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen"
      >
        {currentTheme === 'FallingText' && <FallingText links={links} />}
        {currentTheme === 'FallingShapes' && <FallingShapes links={links} />}
      </motion.div>
    </AnimatePresence>
  );
}
