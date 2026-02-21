// src/components/ThemeRenderer.tsx
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { LinkItem } from '@/data/links';
import { FallingText } from '@/components/themes/FallingText';
import { FallingShapes } from '@/components/themes/FallingShapes';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeRendererProps {
  links: LinkItem[];
}

const MAX_WAIT_MS = 5000; // onAllFallen 미호출 시 최대 대기 (안전장치)

export function ThemeRenderer({ links }: ThemeRendererProps) {
  const { currentTheme, exitTransitionToTheme, completeExitTransition } = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const handleAllFallen = useCallback(() => {
    if (!exitTransitionToTheme || completedRef.current) return;
    completedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    completeExitTransition(exitTransitionToTheme);
  }, [exitTransitionToTheme, completeExitTransition]);

  useEffect(() => {
    if (!exitTransitionToTheme) return;
    completedRef.current = false;

    // 안전장치: 최대 5초 후에는 강제 전환
    const nextTheme = exitTransitionToTheme;
    timeoutRef.current = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        completeExitTransition(nextTheme);
      }
      timeoutRef.current = null;
    }, MAX_WAIT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [exitTransitionToTheme, completeExitTransition]);

  const isExiting = !!exitTransitionToTheme;
  const displayTheme = currentTheme; // 전환 완료 전까지 현재 테마 유지

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen"
      >
        {displayTheme === 'FallingText' && (
          <FallingText links={links} isExiting={isExiting} onAllFallen={handleAllFallen} />
        )}
        {displayTheme === 'FallingShapes' && (
          <FallingShapes links={links} isExiting={isExiting} onAllFallen={handleAllFallen} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
