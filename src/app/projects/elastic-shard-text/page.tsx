'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  axes: ['wght'],
  display: 'swap',
});

// 파티클 색상 팔레트
const PARTICLE_COLORS = [
  '#ffffff', // White
  '#ffffff', 
  '#00f3ff', // Cyan
  '#bc13fe', // Purple
  '#ff0055', // Pink
  '#ffd700', // Gold
];

export default function ElasticShardTextPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [explodedIndices, setExplodedIndices] = useState<number[]>([]);
  
  const TEXT = "ENTROPY";
  
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const letterPositions = useRef<{x: number, y: number, width: number, height: number, left: number, top: number}[]>([]);
  const letterWeights = useRef<number[]>([]);
  const targetWeights = useRef<number[]>([]);
  
  const shardsRef = useRef<any[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // 0. 폰트 로딩 체크
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // 1. 초기화 (Elastic)
  useEffect(() => {
    if (letterWeights.current.length === 0) {
      letterWeights.current = new Array(TEXT.length).fill(100);
      targetWeights.current = new Array(TEXT.length).fill(100);
    }

    const initLetters = () => {
      if (lettersRef.current.length === 0) return;
      
      letterPositions.current = lettersRef.current.map(span => {
        const rect = span.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const observer = new ResizeObserver(initLetters);
    if (containerRef.current) observer.observe(containerRef.current);
    if (fontsLoaded) initLetters();

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [fontsLoaded]);

  // 2. 통합 애니메이션 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      // --- A. Elastic Text ---
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      lettersRef.current.forEach((span, index) => {
        if (!span || explodedIndices.includes(index)) return;

        const pos = letterPositions.current[index];
        if (!pos) return;

        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 300;
        const minWeight = 100;
        const maxWeight = 900;

        let target = minWeight;
        if (dist < maxDist) {
          const ratio = 1 - (dist / maxDist);
          target = minWeight + (maxWeight - minWeight) * ratio;
        }
        targetWeights.current[index] = target;

        const current = letterWeights.current[index];
        const next = current + (targetWeights.current[index] - current) * 0.1;
        letterWeights.current[index] = next;
        
        span.style.fontVariationSettings = `'wght' ${Math.round(next)}`;
      });

      // --- B. Shard Particles ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (shardsRef.current.length > 0) {
        
        for (let i = shardsRef.current.length - 1; i >= 0; i--) {
          const shard = shardsRef.current[i];
          
          if (shard.returning) {
            // --- 복귀 모드 ---
            shard.x += (shard.originX - shard.x) * 0.15;
            shard.y += (shard.originY - shard.y) * 0.15;
            shard.rotation += (0 - shard.rotation) * 0.15;
            
            const dx = shard.originX - shard.x;
            const dy = shard.originY - shard.y;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
              shardsRef.current.splice(i, 1);
              continue;
            }
          } else {
            // --- 폭발/부유 모드 ---
            shard.x += shard.vx;
            shard.y += shard.vy;
            
            const speed = Math.sqrt(shard.vx * shard.vx + shard.vy * shard.vy);
            // 마찰: 빠르면 급제동(0.9), 느리면 무중력(1.0)
            const friction = speed > 5 ? 0.9 : 1.0;
            
            shard.vx *= friction;
            shard.vy *= friction;
            shard.rotation += shard.vRotation;

            if (shard.x < 0 || shard.x > canvas.width) shard.vx *= -1;
            if (shard.y < 0 || shard.y > canvas.height) shard.vy *= -1;
            
            // 유영 (속도 낮을 때)
            if (speed < 5) {
              shard.vx += (Math.random() - 0.5) * 0.01;
              shard.vy += (Math.random() - 0.5) * 0.01;
              
              shard.vx *= 0.99; 
              shard.vy *= 0.99;
            }
          }

          ctx.save();
          ctx.translate(shard.x, shard.y);
          ctx.rotate(shard.rotation);
          
          // 다각형 그리기 (vertices 배열 사용)
          ctx.beginPath();
          if (shard.vertices && shard.vertices.length > 0) {
            ctx.moveTo(shard.vertices[0].x, shard.vertices[0].y);
            for (let j = 1; j < shard.vertices.length; j++) {
              ctx.lineTo(shard.vertices[j].x, shard.vertices[j].y);
            }
          }
          ctx.closePath();
          
          ctx.fillStyle = shard.color;
          ctx.fill();
          ctx.restore();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [explodedIndices]); 

  // 3. 클릭 핸들러
  const handleLetterClick = (index: number) => {
    if (explodedIndices.includes(index)) return;
    if (!fontsLoaded) return;

    setExplodedIndices(prev => [...prev, index]);
    createShardsForLetter(index);

    setTimeout(() => {
      shardsRef.current.forEach(shard => {
        if (shard.letterIndex === index) {
          shard.returning = true;
        }
      });

      setTimeout(() => {
        setExplodedIndices(prev => prev.filter(i => i !== index));
      }, 800);
      
    }, 3000);
  };

  const createShardsForLetter = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    tempCanvas.width = window.innerWidth;
    tempCanvas.height = window.innerHeight;

    const pos = letterPositions.current[index];
    const weight = letterWeights.current[index] || 100;

    tempCtx.fillStyle = 'white';
    tempCtx.font = `${Math.round(weight)} 15vw ${inter.style.fontFamily}, sans-serif`;
    tempCtx.textAlign = 'center';
    
    tempCtx.textBaseline = 'top'; 
    const yOffset = pos.height * 0.05; 
    tempCtx.fillText(TEXT[index], pos.x, pos.top + yOffset);
    
    const padding = 20;
    const scanX = Math.max(0, Math.floor(pos.left - padding));
    const scanY = Math.max(0, Math.floor(pos.top - padding));
    const scanW = Math.min(tempCanvas.width - scanX, Math.floor(pos.width + padding * 2));
    const scanH = Math.min(tempCanvas.height - scanY, Math.floor(pos.height + padding * 2));

    const imageData = tempCtx.getImageData(scanX, scanY, scanW, scanH);
    const data = imageData.data;
    const newShards = [];
    const step = 4;

    for (let y = 0; y < scanH; y += step) {
      for (let x = 0; x < scanW; x += step) {
        const idx = (y * scanW + x) * 4;
        if (data[idx + 3] > 128) {
          const globalX = scanX + x;
          const globalY = scanY + y;

          // 랜덤 다각형 및 크기 설정 (변수 선언 위치 수정)
          const vertexCount = Math.floor(Math.random() * 3) + 3; // 3~5각형
          
          // 크기 (지수 분포) - 최대 5배로 조정
          const scale = Math.pow(Math.random(), 3) * 5; 
          const size = step * (0.5 + scale);
          
          const vertices = [];
          for (let j = 0; j < vertexCount; j++) {
            const angle = (j / vertexCount) * Math.PI * 2;
            const r = size * (0.5 + Math.random() * 0.5); // 반지름 변형
            vertices.push({
              x: Math.cos(angle) * r,
              y: Math.sin(angle) * r
            });
          }

          newShards.push({
            x: globalX,
            y: globalY,
            originX: globalX,
            originY: globalY,
            vx: (Math.random() - 0.5) * 150,
            vy: (Math.random() - 0.5) * 150,
            rotation: Math.random() * Math.PI * 2,
            vRotation: (Math.random() - 0.5) * 0.05, // 회전 속도 대폭 감소 (0.5 -> 0.05)
            size: size,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
            letterIndex: index, 
            returning: false,   
            vertices: vertices 
          });
        }
      }
    }

    shardsRef.current = [...shardsRef.current, ...newShards];
  };

  const handleReset = () => {
    setExplodedIndices([]);
    shardsRef.current = [];
    letterWeights.current.fill(100);
    targetWeights.current.fill(100);
  };

  return (
    <div className={`min-h-screen bg-black overflow-hidden flex items-center justify-center select-none ${inter.className}`}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />

      <div 
        ref={containerRef}
        className="relative z-10 flex gap-[0.05em]"
      >
        {TEXT.split('').map((char, i) => (
          <span
            key={i}
            ref={el => { if (el) lettersRef.current[i] = el; }}
            onClick={(e) => {
              e.stopPropagation();
              handleLetterClick(i);
            }}
            className="text-white text-[15vw] leading-none inline-block will-change-transform font-black cursor-pointer hover:text-gray-200 transition-colors duration-1000"
            style={{ 
              fontVariationSettings: "'wght' 100",
              opacity: explodedIndices.includes(i) ? 0 : 1,
              pointerEvents: explodedIndices.includes(i) ? 'none' : 'auto'
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
