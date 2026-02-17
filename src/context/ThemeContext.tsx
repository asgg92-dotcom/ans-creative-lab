'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 여기에 새로운 테마 ID를 계속 추가할 수 있습니다.
export type ThemeType = 'FallingText' | 'FallingShapes'; 

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[]; // UI에 보여줄 테마 목록
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 기본값은 FallingText로 설정하되, 클라이언트에서 랜덤으로 변경
  const [currentTheme, setTheme] = useState<ThemeType>('FallingText');
  const availableThemes: ThemeType[] = ['FallingText', 'FallingShapes'];

  useEffect(() => {
    // 클라이언트 사이드에서만 실행 (Hydration Error 방지)
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomTheme = availableThemes[randomIndex];
    console.log('Random Theme Selected:', randomTheme, randomIndex); // 디버깅용 로그
    setTheme(randomTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
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
