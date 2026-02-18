'use client';

import { useEffect, useRef, useState } from 'react';
import Zdog from 'zdog';
import gsap from 'gsap';

// --- 2. 비주얼 가이드라인 (Aesthetic) ---
const PALETTE = {
  day: {
    bg: '#A9D0F5',     // Soft Blue
    lampBody: '#FF7F50', // Coral
    lampLight: 'rgba(255, 255, 0, 0)', 
    radio: '#3498DB',  // Blue
    plant: '#2ECC71',  // Green
    cameraBody: '#34495E', // Dark Blue Grey (Leather)
    cameraTop: '#BDC3C7',  // Silver
    windowSky: '#00BFFF', // Deep Sky Blue
  },
  night: {
    bg: '#2C3E50',     // Deep Navy
    lampBody: '#E74C3C', // Warm Red
    lampLight: '#F1C40F', // Yellow Light
    radio: '#2980B9',
    plant: '#27AE60',
    cameraBody: '#2C3E50',
    cameraTop: '#95A5A6',
    windowSky: '#1a252f', // Dark Sky
  }
};

export default function ProjectBeta() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // --- 상태 관리 ---
  const [isNight, setIsNight] = useState(false);
  const isNightRef = useRef(isNight);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  
  const [leafCount, setLeafCount] = useState(0);
  const [filterMode, setFilterMode] = useState<'none' | 'sepia' | 'grain'>('none');

  useEffect(() => { isNightRef.current = isNight; }, [isNight]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // --- Zdog Refs ---
  const illoRef = useRef<Zdog.Illustration | null>(null);
  
  // Interaction Groups (Click Detection)
  const lampGroupRef = useRef<Zdog.Group | null>(null);
  const radioGroupRef = useRef<Zdog.Group | null>(null);
  const plantGroupRef = useRef<Zdog.Group | null>(null);
  const cameraGroupRef = useRef<Zdog.Group | null>(null);
  const mugGroupRef = useRef<Zdog.Group | null>(null);

  // Parts for Animation/Update
  const lampLightRef = useRef<Zdog.Ellipse | null>(null);
  const radioBodyRef = useRef<Zdog.RoundedRect | null>(null);
  const plantStemRef = useRef<Zdog.Shape | null>(null);
  const windowSkyRef = useRef<Zdog.Rect | null>(null);
  
  // Particles (Dust + Steam)
  const particlesRef = useRef<{ shape: Zdog.Shape, originalPos: {x:number, y:number, z:number} }[]>([]);
  const steamsRef = useRef<{ shape: any, originalY: number, speed: number }[]>([]);
  const cloudsRef = useRef<{ shape: Zdog.Shape, speed: number }[]>([]);

  // Screen Positions
  const screenPositions = useRef<{ [key: string]: { x: number, y: number } }>({});

  const requestRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // --- 1. Audio System ---
  const toggleAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (isPlaying) {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
      setIsPlaying(false);
    } else {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, audioContextRef.current.currentTime);
      
      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = 4;
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = 10; 
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      gain.gain.value = 0.05;
      osc.start();
      oscillatorRef.current = osc;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || illoRef.current) return;

    // --- 2. Zdog 초기화 ---
    const illo = new Zdog.Illustration({
      element: canvasRef.current,
      zoom: 0.8, // [복구] 원래 줌 값 (0.8)
      dragRotate: true,
      rotate: { x: -Zdog.TAU / 12 }, 
    });
    illoRef.current = illo;

    // --- 3. 씬 구성 ---
    const scene = new Zdog.Group({ addTo: illo, translate: { y: 20 } });

    // [Desk] - Wide Desk
    new Zdog.Box({
      addTo: scene,
      width: 600,
      height: 10,
      depth: 300,
      stroke: false,
      color: '#8D6E63',
      leftFace: '#6D4C41',
      rightFace: '#6D4C41',
      topFace: '#A1887F',
      bottomFace: '#5D4037',
    });

    // --- BACK ROW ---

    // ① [전등: Lamp] - Left Back
    lampGroupRef.current = new Zdog.Group({ addTo: scene, translate: { x: -200, z: -80 } });
    new Zdog.Cylinder({
      addTo: lampGroupRef.current,
      diameter: 40,
      length: 5,
      stroke: false,
      color: PALETTE.day.lampBody,
      rotate: { x: Zdog.TAU / 4 },
    });
    new Zdog.Shape({ 
      addTo: lampGroupRef.current,
      path: [{ y: 0 }, { y: -60 }, { x: 40, y: -80 }],
      stroke: 8,
      color: '#555',
      closed: false,
    });
    const lampHead = new Zdog.Cone({
      addTo: lampGroupRef.current,
      diameter: 30,
      length: 30,
      stroke: false,
      color: PALETTE.day.lampBody,
      translate: { x: 40, y: -80 },
      rotate: { y: Zdog.TAU / 2, x: Zdog.TAU / 8 },
    });
    lampLightRef.current = new Zdog.Ellipse({
      addTo: lampHead,
      diameter: 20,
      stroke: false,
      fill: true,
      color: PALETTE.day.lampLight,
      translate: { z: 5 },
      visible: false,
    });

    // ⑥ [창문: Window] - Center Back Behind
    const windowGroup = new Zdog.Group({ addTo: scene, translate: { x: 0, z: -250, y: -80 } });
    new Zdog.Rect({ // Frame
      addTo: windowGroup,
      width: 200,
      height: 120,
      stroke: 10,
      color: '#fff',
    });
    windowSkyRef.current = new Zdog.Rect({ // Glass
        addTo: windowGroup,
        width: 180,
        height: 100,
        stroke: false,
        fill: true,
        color: PALETTE.day.windowSky,
        translate: { z: -2 },
    });
    // Clouds
    for(let i=0; i<5; i++) {
        const cloud = new Zdog.Shape({
            addTo: windowGroup,
            stroke: 20 + Math.random() * 20,
            color: '#fff',
            translate: { 
                x: -80 + Math.random() * 160, 
                y: -40 + Math.random() * 80, 
                z: -10 
            },
        });
        cloudsRef.current.push({ shape: cloud, speed: 0.1 + Math.random() * 0.2 });
    }

    // ② [라디오: Radio] - Right Back
    radioGroupRef.current = new Zdog.Group({ addTo: scene, translate: { x: 200, z: -80 } });
    radioBodyRef.current = new Zdog.RoundedRect({
      addTo: radioGroupRef.current,
      width: 80,
      height: 50,
      cornerRadius: 5,
      stroke: 20,
      color: PALETTE.day.radio,
      fill: true,
    });
    new Zdog.Ellipse({ addTo: radioGroupRef.current, diameter: 25, translate: { x: -20 }, stroke: 2, color: '#eee' });
    new Zdog.Ellipse({ addTo: radioGroupRef.current, diameter: 12, translate: { x: 20, y: 5 }, stroke: 4, color: '#333' });
    new Zdog.Shape({ addTo: radioGroupRef.current, path: [{ y: -25 }, { y: -60, x: 15 }], stroke: 3, color: '#ccc' });

    // --- FRONT ROW ---

    // ③ [다육식물: Plant] - Left Front
    plantGroupRef.current = new Zdog.Group({ addTo: scene, translate: { x: -150, z: 80 } });
    new Zdog.Cone({
      addTo: plantGroupRef.current,
      diameter: 30,
      length: 25,
      stroke: false,
      color: '#E67E22', 
      rotate: { x: Zdog.TAU / 4 },
      translate: { y: -12.5 },
    });
    plantStemRef.current = new Zdog.Shape({
      addTo: plantGroupRef.current,
      path: [{ y: -25 }, { y: -60 }],
      stroke: 6,
      color: PALETTE.day.plant,
      translate: { y: -10 },
    });

    // ⑦ [머그컵: Mug] - Center Front
    mugGroupRef.current = new Zdog.Group({ addTo: scene, translate: { x: 0, z: 80 } });
    new Zdog.Cylinder({
      addTo: mugGroupRef.current,
      diameter: 35,
      length: 40,
      stroke: false,
      color: '#ecf0f1',
      rotate: { x: Zdog.TAU / 4 },
      translate: { y: -20 },
    });
    new Zdog.Ellipse({ // Coffee
        addTo: mugGroupRef.current,
        diameter: 28,
        stroke: false,
        fill: true,
        color: '#4E342E',
        rotate: { x: Zdog.TAU / 4 },
        translate: { y: -40 },
    });
    new Zdog.Shape({ // Handle
      addTo: mugGroupRef.current,
      path: [{ x: 18, y: -30 }, { arc: [{ x: 30, y: -30 }, { x: 30, y: -10 }] }, { arc: [{ x: 30, y: 5 }, { x: 18, y: 5 }] }],
      stroke: 6,
      color: '#ecf0f1',
      closed: false,
    });
    // Steam
    for(let i=0; i<3; i++) {
        const steam = new Zdog.Ellipse({
            addTo: mugGroupRef.current,
            width: 10,
            height: 10,
            stroke: 4,
            color: '#fff',
            translate: { y: -50 - (i*15) },
            rotate: { y: Zdog.TAU/4 },
            opacity: 0,
        } as any);
        steamsRef.current.push({ shape: steam, originalY: -50, speed: 0.3 + Math.random() * 0.2 });
    }

    // ④ [카메라: Camera] - Right Front (업그레이드)
    cameraGroupRef.current = new Zdog.Group({ addTo: scene, translate: { x: 150, z: 80 } });
    
    // 1. 하단 바디 (가죽 느낌)
    new Zdog.RoundedRect({
        addTo: cameraGroupRef.current,
        width: 70,
        height: 30,
        cornerRadius: 4,
        stroke: 12,
        color: PALETTE.day.cameraBody,
        fill: true,
        translate: { y: -5 },
    });
    
    // 2. 상단 바디 (실버 메탈)
    new Zdog.RoundedRect({
        addTo: cameraGroupRef.current,
        width: 70,
        height: 15,
        cornerRadius: 4,
        stroke: 12,
        color: PALETTE.day.cameraTop,
        fill: true,
        translate: { y: -27.5 },
    });

    // 3. 렌즈 경통 (3단 구조로 입체감)
    const lensGroup = new Zdog.Group({ addTo: cameraGroupRef.current, translate: { z: 10, y: -15 } });
    
    // 렌즈 베이스
    new Zdog.Cylinder({
        addTo: lensGroup,
        diameter: 36,
        length: 5,
        stroke: false,
        color: '#95A5A6', // Silver Ring
        rotate: { x: Zdog.TAU / 4 },
        translate: { z: 0 },
    });
    // 렌즈 중간
    new Zdog.Cylinder({
        addTo: lensGroup,
        diameter: 30,
        length: 5,
        stroke: false,
        color: '#2C3E50', // Dark Ring
        rotate: { x: Zdog.TAU / 4 },
        translate: { z: 5 },
    });
    // 렌즈 앞부분
    new Zdog.Cylinder({
        addTo: lensGroup,
        diameter: 24,
        length: 2,
        stroke: false,
        color: '#111', // Lens Cap area
        rotate: { x: Zdog.TAU / 4 },
        translate: { z: 8 },
    });
    // 렌즈 알 (유리)
    new Zdog.Ellipse({
        addTo: lensGroup,
        diameter: 20,
        stroke: false,
        fill: true,
        color: '#2980B9', // Blueish Lens
        translate: { z: 9 },
    });
    // 렌즈 반사광 (Highlight)
        new Zdog.Ellipse({
            addTo: lensGroup,
            diameter: 6,
            stroke: false,
            fill: true,
            color: '#FFF',
            translate: { z: 9.1, x: -5, y: -5 },
            opacity: 0.6,
        } as any);

    // 4. 디테일 (뷰파인더, 셔터, 플래시)
    // 뷰파인더
    new Zdog.Rect({
        addTo: cameraGroupRef.current,
        width: 12,
        height: 8,
        stroke: 2,
        color: '#333',
        fill: true,
        translate: { x: 0, y: -30, z: 6 },
    });
    // 셔터 버튼 (빨강)
    new Zdog.Cylinder({
        addTo: cameraGroupRef.current,
        diameter: 8,
        length: 4,
        stroke: false,
        color: '#E74C3C',
        rotate: { x: Zdog.TAU / 4 },
        translate: { x: 25, y: -38 },
    });
    // 플래시
    new Zdog.RoundedRect({
        addTo: cameraGroupRef.current,
        width: 12,
        height: 8,
        cornerRadius: 2,
        stroke: 2,
        color: '#FFF',
        fill: true,
        translate: { x: -25, y: -30, z: 6 },
    });


    // ⑤ [공중 먼지: Particles]
    for(let i=0; i<20; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 300 - 50;
        const z = (Math.random() - 0.5) * 400;
        const p = new Zdog.Shape({
            addTo: scene,
            stroke: 2 + Math.random() * 4,
            color: '#fff',
            translate: { x, y, z },
        });
        particlesRef.current.push({ shape: p, originalPos: {x, y, z} });
    }

    // --- 4. 애니메이션 루프 ---
    const animate = () => {
      const time = timeRef.current += 0.02;

      // 4-1. Passive Motion (Floating)
      scene.translate.y = 20 + Math.sin(time) * 2;

      // 4-2. Parallax View
      const targetRotateY = (mouseRef.current.x * Zdog.TAU) / 8;
      const targetRotateX = (mouseRef.current.y * Zdog.TAU) / 16;
      
      scene.rotate.y = Zdog.lerp(scene.rotate.y, targetRotateY, 0.05);
      scene.rotate.x = Zdog.lerp(scene.rotate.x, targetRotateX, 0.05);

      // 4-3. Radio Bounce
      if (radioBodyRef.current && isPlayingRef.current) {
          const scale = 1 + Math.sin(time * 15) * 0.1;
          radioBodyRef.current.scale = { x: scale, y: scale, z: scale } as any; 
      } else if (radioBodyRef.current) {
          radioBodyRef.current.scale = { x: 1, y: 1, z: 1 } as any;
      }

      // 4-4. Steam
      steamsRef.current.forEach(s => {
          s.shape.translate.y -= s.speed;
          const dist = Math.abs(s.shape.translate.y - s.originalY);
          s.shape.opacity = Math.max(0, 1 - dist/50);
          if(s.shape.translate.y < -100) {
              s.shape.translate.y = s.originalY;
              s.shape.opacity = 0;
          }
      });

      // 4-5. Cloud
      cloudsRef.current.forEach(c => {
          c.shape.translate.x += c.speed;
          if(c.shape.translate.x > 100) c.shape.translate.x = -100;
      });

      // 4-6. Particle Attraction
      const mouse3D = {
          x: mouseRef.current.x * 600,
          y: mouseRef.current.y * 300,
      };
      particlesRef.current.forEach(p => {
          const floatOffset = Math.sin(time + p.originalPos.x) * 5;
          const dx = mouse3D.x - p.shape.translate.x;
          const dy = mouse3D.y - p.shape.translate.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 150) { 
              p.shape.translate.x += dx * 0.02;
              p.shape.translate.y += dy * 0.02;
          } else { 
              p.shape.translate.x = Zdog.lerp(p.shape.translate.x, p.originalPos.x, 0.03);
              p.shape.translate.y = Zdog.lerp(p.shape.translate.y, p.originalPos.y + floatOffset, 0.03);
          }
      });

      illo.updateRenderGraph();

      // Store positions for click
      if (lampGroupRef.current) screenPositions.current.lamp = (lampGroupRef.current as any).renderOrigin;
      if (radioGroupRef.current) screenPositions.current.radio = (radioGroupRef.current as any).renderOrigin;
      if (plantGroupRef.current) screenPositions.current.plant = (plantGroupRef.current as any).renderOrigin;
      if (cameraGroupRef.current) screenPositions.current.camera = (cameraGroupRef.current as any).renderOrigin;
      if (mugGroupRef.current) screenPositions.current.mug = (mugGroupRef.current as any).renderOrigin;

      requestRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); 

  // --- 5. 인터랙션 ---
  
  // 식물 성장 (수정됨: GSAP scale fix)
  useEffect(() => {
      const interval = setInterval(() => setLeafCount(c => c + 1), 30000); 
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (!plantStemRef.current || leafCount === 0) return;
      const yPos = -25 - (leafCount * 8);
      const angle = (leafCount % 2 === 0) ? 1 : -1;
      
      const leaf = new Zdog.Ellipse({
          addTo: plantStemRef.current,
          width: 15, height: 8, stroke: 2,
          color: isNight ? PALETTE.night.plant : PALETTE.day.plant,
          fill: true, translate: { y: yPos, x: 5 * angle }, rotate: { z: -0.5 * angle },
          scale: { x: 0, y: 0, z: 0 } as any, // 초기값 0
      });
      
      // GSAP Animation Fix
      // Zdog 객체의 scale 프로퍼티({x,y,z})를 직접 업데이트해야 함
      const proxy = { s: 0 };
      gsap.to(proxy, {
          s: 1, 
          duration: 1.5, 
          ease: "elastic.out(1, 0.3)",
          onUpdate: () => { 
              // Uniform scale 적용
              leaf.scale.x = proxy.s;
              leaf.scale.y = proxy.s;
              leaf.scale.z = proxy.s;
          }
      });
  }, [leafCount, isNight]);

  // 상태 변화 업데이트
  useEffect(() => {
    if (!illoRef.current) return;
    const theme = isNight ? PALETTE.night : PALETTE.day;

    if (lampLightRef.current) lampLightRef.current.visible = isNight;
    
    gsap.to('body', { backgroundColor: theme.bg, duration: 1.5 });
    
    if (lampLightRef.current) lampLightRef.current.color = theme.lampLight;
    if (windowSkyRef.current) windowSkyRef.current.color = theme.windowSky;

  }, [isNight, filterMode]);

  // 클릭 처리
  const handleClick = (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      let closest = null;
      let minDist = 120; // Hit radius

      Object.entries(screenPositions.current).forEach(([key, pos]) => {
          if (!pos) return;
          const screenX = pos.x + rect.width / 2;
          const screenY = pos.y + rect.height / 2;
          const dist = Math.sqrt(Math.pow(clickX - screenX, 2) + Math.pow(clickY - screenY, 2));
          if (dist < minDist) {
              minDist = dist;
              closest = key;
          }
      });

      if (closest === 'lamp') setIsNight(prev => !prev);
      else if (closest === 'radio') toggleAudio();
      else if (closest === 'plant') setLeafCount(c => c + 1);
      else if (closest === 'mug') {
          const steam = new Zdog.Ellipse({
            addTo: mugGroupRef.current, width: 15, height: 15, stroke: 4, color: '#fff',
            translate: { y: -50 }, rotate: { y: Zdog.TAU/4 }, opacity: 1,
          } as any);
          steamsRef.current.push({ shape: steam, originalY: -50, speed: 0.5 });
      }
      else if (closest === 'camera') {
          const flash = document.createElement('div');
          Object.assign(flash.style, { position: 'fixed', inset: '0', backgroundColor: 'white', zIndex: '9999', pointerEvents: 'none', opacity: '1' });
          document.body.appendChild(flash);
          gsap.to(flash, { opacity: 0, duration: 0.8, onComplete: () => flash.remove() });
          setFilterMode(prev => prev === 'none' ? 'sepia' : (prev === 'sepia' ? 'grain' : 'none'));
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      mouseRef.current = {
          x: (e.clientX - width / 2) / width,
          y: (e.clientY - height / 2) / height
      };
  };

  return (
    <div 
        className="flex flex-col items-center justify-center min-h-screen w-full overflow-hidden"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
    >
      <canvas 
        ref={canvasRef} 
        width={1000} // [복구] 원래 해상도 (1000)
        height={600} // [복구] 원래 해상도 (600)
        className="touch-none w-full max-w-6xl h-auto" // [복구] 원래 최대 폭 (max-w-6xl)
        style={{
            filter: filterMode === 'sepia' ? 'sepia(0.8)' : filterMode === 'grain' ? 'contrast(1.2) brightness(0.9) grayscale(0.5)' : 'none',
            transition: 'filter 0.5s ease'
        }}
      />
    </div>
  );
}
