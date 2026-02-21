'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const age = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.min(100, age));
}

type Phase = 'title' | 'input' | 'result';

export default function LifeLine100Page() {
  const [phase, setPhase] = useState<Phase>('title');
  const [birthInput, setBirthInput] = useState('2000-01-01');
  const [age, setAge] = useState<number | null>(null);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // 1초 페이드인 + 1초 유지 후 → 1초 페이드아웃/페이드인 전환
  useEffect(() => {
    if (phase !== 'title') return;
    const t = setTimeout(() => setPhase('input'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleCalculate = useCallback(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthInput)) return;
    const birthDate = new Date(birthInput);
    if (isNaN(birthDate.getTime())) return;
    const a = calculateAge(birthDate);
    setAge(a);
    setDisplayPercentage(0);
    setPhase('result');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDisplayPercentage(a));
    });
  }, [birthInput]);

  const handleReset = useCallback(() => {
    setPhase('input');
    setAge(null);
    setDisplayPercentage(0);
  }, []);

  const hasAnimated = age !== null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col p-6">
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {/* 1. 타이틀: 1초 페이드인 → 1초 유지 → 1초 페이드아웃 (입력창과 동시) */}
          {phase === 'title' && (
            <motion.div
              key="title"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <h1 className="text-4xl md:text-6xl font-light text-center m-0">
                LifeLine 100
              </h1>
            </motion.div>
          )}

          {/* 2. 입력창: 타이틀 페이드아웃 완료 후 즉시 표시 */}
          {phase === 'input' && (
            <div key="input" className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <input
                type="text"
                inputMode="numeric"
                placeholder="YYYY-MM-DD"
                value={birthInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCalculate();
                }}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, '').slice(0, 8);
                  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4, 6) + (v.length > 6 ? '-' + v.slice(6) : '');
                  else if (v.length > 0) v = v.slice(0, 4);
                  setBirthInput(v);
                }}
                className="w-full max-w-[400px] px-4 py-6 rounded-lg border-0 bg-transparent text-white text-5xl md:text-6xl outline-none text-center placeholder:text-white/40"
              />
              <button
                onClick={handleCalculate}
                className="mt-8 py-3 text-[#888] hover:text-[#aaa] transition-colors border-0 bg-transparent"
              >
                계산하기
              </button>
            </div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. 결과 화면 */}
        {phase === 'result' && (
          <div className="w-full max-w-[800px] text-center">
            {/* 시각화 */}
            <div className="relative w-full h-[100px]">
              <span className="absolute left-0 top-5 text-sm text-[#888]">0세</span>
              <span
                className="absolute top-5 text-sm text-[#888] -translate-x-1/2"
                style={{ left: '80%' }}
              >
                80세
              </span>
              {hasAnimated && age !== null && (
                <span
                  className="absolute top-[-35px] text-white font-bold text-lg whitespace-nowrap transition-[left] duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                  style={{ left: `${displayPercentage}%`, transform: 'translateX(-50%)' }}
                >
                  {Math.floor(age)}세
                </span>
              )}
              <span className="absolute right-0 top-5 text-sm text-[#888]">100세</span>

              <div
                className="absolute top-1/2 left-0 w-full h-[2px] bg-[#333] -translate-y-1/2"
                aria-hidden
              />

              {hasAnimated && (
                <>
                  <div
                    className="absolute top-1/2 left-0 h-[3px] bg-white -translate-y-1/2 transition-[width] duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{ width: `${displayPercentage}%` }}
                  />
                  <div
                    className="absolute top-1/2 left-0 w-[10px] h-[10px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-[left] duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{ left: `calc(${displayPercentage}% - 5px)`, transform: 'translateY(-50%)' }}
                  />
                </>
              )}
            </div>

            <button
              onClick={handleReset}
              className="mt-16 py-3 text-[#888] hover:text-[#aaa] transition-colors border-0 bg-transparent"
            >
              다시하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
