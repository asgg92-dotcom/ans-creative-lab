'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const DISABLE_CUSTOM_CURSOR_PATHS = ['/projects/circle-draw'];

export function CustomCursor() {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [shouldHideCursor, setShouldHideCursor] = useState(false);

  const useDefaultCursor = DISABLE_CUSTOM_CURSOR_PATHS.some((p) =>
    pathname?.startsWith(p)
  );

  useEffect(() => {
    // 터치 디바이스에서는 커스텀 커서 비활성화
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // prefers-reduced-motion: 접근성 - 애니메이션/커스텀 UI 선호도 존중
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateShouldHide = () => setShouldHideCursor(!reducedMotionQuery.matches);
    updateShouldHide();
    reducedMotionQuery.addEventListener('change', updateShouldHide);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateShouldHide);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [isVisible]);

  if (useDefaultCursor || !isVisible || !shouldHideCursor) return null;

  return (
    <>
      <style jsx global>{`
        /* PC에서만 기본 커서 숨김 (prefers-reduced-motion 미적용 시) */
        @media (pointer: fine) {
          body,
          a,
          button,
          input,
          [tabindex]:not([tabindex="-1"]) {
            cursor: none !important;
          }
        }
      `}</style>
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full bg-orange-500 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
        aria-hidden
      />
    </>
  );
}
