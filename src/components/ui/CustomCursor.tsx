'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 터치 디바이스에서는 커스텀 커서 비활성화
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style jsx global>{`
        /* PC에서만 기본 커서 숨김 */
        @media (pointer: fine) {
          body, a, button, input {
            cursor: none !important;
          }
        }
      `}</style>
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full bg-orange-500 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 12, // 중앙 정렬 (w/2)
          y: mousePosition.y - 12, // 중앙 정렬 (h/2)
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />
    </>
  );
}
