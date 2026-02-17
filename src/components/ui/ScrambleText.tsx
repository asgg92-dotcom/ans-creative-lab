'use client';

import { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

interface ScrambleTextProps {
  text: string;
  interval?: number; // 반복 주기 (ms)
}

export function ScrambleText({ text, interval = 3000 }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isAnimating = useRef(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scramble = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      let iteration = 0;
      const totalIterations = text.length * 3; // 텍스트 길이의 3배만큼 루프

      const intervalId = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split('')
            .map((char, index) => {
              if (index < iteration / 3) { // 앞쪽부터 하나씩 원래 글자로 복구
                return text[index];
              }
              // 나머지는 랜덤 문자
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );

        if (iteration >= totalIterations) {
          clearInterval(intervalId);
          setDisplayText(text); // 최종적으로 원래 텍스트로 복구
          isAnimating.current = false;
        }

        iteration += 1;
      }, 30); // 30ms마다 갱신 (프레임 속도)
    };

    // 최초 실행 (선택사항, 원하면 주석 해제)
    // scramble();

    // 3초마다 반복 실행
    timeoutId = setInterval(scramble, interval);

    return () => {
      clearInterval(timeoutId);
    };
  }, [text, interval]);

  return <span>{displayText}</span>;
}
