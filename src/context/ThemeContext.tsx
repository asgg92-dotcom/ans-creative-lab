'use client';

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';

// 여기에 새로운 테마 ID를 계속 추가할 수 있습니다.
export type ThemeType = 'FallingText' | 'FallingShapes'; 

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[];
  /** Shuffle 시 현재 테마를 먼저 떨어뜨린 뒤 전환 */
  triggerExitTransition: (nextTheme: ThemeType) => void;
  completeExitTransition: (theme: ThemeType) => void;
  exitTransitionToTheme: ThemeType | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setTheme] = useState<ThemeType>('FallingText');
  const [exitTransitionToTheme, setExitTransitionToTheme] = useState<ThemeType | null>(null);
  const availableThemes: ThemeType[] = ['FallingText', 'FallingShapes'];

  const triggerExitTransition = useCallback((nextTheme: ThemeType) => {
    setExitTransitionToTheme((prev) => (prev ? prev : nextTheme));
  }, []);

  const completeExitTransition = useCallback((theme: ThemeType) => {
    setTheme(theme);
    setExitTransitionToTheme(null);
  }, []);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행 (Hydration Error 방지)
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomTheme = availableThemes[randomIndex];
    console.log('Random Theme Selected:', randomTheme, randomIndex); // 디버깅용 로그
    setTheme(randomTheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        availableThemes,
        triggerExitTransition,
        completeExitTransition,
        exitTransitionToTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
