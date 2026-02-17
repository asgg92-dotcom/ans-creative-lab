'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { LinkItem } from '@/data/links';

interface FallingTextProps {
  links: LinkItem[];
}

// 바이브코딩 컬러 팔레트 (형광/비비드) - Hex 코드
const HOVER_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Teal
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
];

export function FallingText({ links }: FallingTextProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    // 중력 약간 강화 (기본값 1 -> 1.5로 조정)
    engine.gravity.y = 1.5;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false,
      },
    });
    renderRef.current = render;

    const groundHeight = 100;
    const wallThickness = 200;
    
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight, 
      window.innerWidth,
      groundHeight,
      { isStatic: true, render: { visible: false }, label: 'ground' }
    );

    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight * 2,
      { isStatic: true, render: { visible: false } }
    );

    const rightWall = Bodies.rectangle(
      window.innerWidth + wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight * 2,
      { isStatic: true, render: { visible: false } }
    );

    World.add(world, [ground, leftWall, rightWall]);

    const textBodies: Matter.Body[] = [];

    links.forEach((link, index) => {
      // 너비 계산 타이트하게 수정
      // 영문 기준 글자당 약 60~70px, 패딩 40px
      const charWidth = 70;
      const padding = 40;
      const width = link.title.length * charWidth + padding; 
      const height = 140; // 높이도 약간 줄임
      
      const x = Math.random() * (window.innerWidth - width) + width / 2;
      // 낙하 높이를 -2000까지 늘려서 랜덤 순서(시차) 확보
      const y = -Math.random() * 2000 - 200;

      const body = Bodies.rectangle(x, y, width, height, {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.01, // 공기 저항 조정 (0.005 -> 0.01)
        angle: (Math.random() - 0.5) * 0.5,
        label: index.toString(),
      });

      textBodies.push(body);
      World.add(world, body);
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    runnerRef.current = runner;

    let animationId: number;
    
    const updateDOM = () => {
      textBodies.forEach((body) => {
        const index = parseInt(body.label);
        const domElement = itemRefs.current[index];

        if (domElement && !isNaN(index)) {
          const { x, y } = body.position;
          const rotation = body.angle;
          domElement.style.transform = `translate(${x - domElement.offsetWidth / 2}px, ${y - domElement.offsetHeight / 2}px) rotate(${rotation}rad)`;
          domElement.style.opacity = '1';
        }
      });
      animationId = requestAnimationFrame(updateDOM);
    };
    
    animationId = requestAnimationFrame(updateDOM);

    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;

      Matter.Body.setPosition(ground, {
        x: window.innerWidth / 2,
        y: window.innerHeight,
      });
      
      Matter.Body.setPosition(rightWall, {
        x: window.innerWidth + wallThickness / 2,
        y: window.innerHeight / 2,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [links]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-black">
      <div ref={sceneRef} className="absolute inset-0 pointer-events-none opacity-0" />

      {links.map((link, index) => {
        const hoverColor = HOVER_COLORS[index % HOVER_COLORS.length];
        const estimatedWidth = link.title.length * 70 + 40; // 물리 엔진과 싱크

        return (
          <a
            key={link.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-0 left-0 flex items-center justify-center cursor-pointer select-none transition-colors duration-300 text-black dark:text-white"
            style={{ 
              width: `${estimatedWidth}px`,
              height: '140px',
              opacity: 0,
              pointerEvents: 'auto',
              willChange: 'transform',
              transformOrigin: '50% 50%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = hoverColor;
            }}
            onMouseLeave={(e) => {
              // 원래 색상으로 복구 (다크모드 고려)
              e.currentTarget.style.color = ''; 
            }}
          >
            <h3 className="text-[5rem] md:text-[8rem] font-black tracking-tighter leading-none text-center w-full whitespace-nowrap">
              {link.title}
            </h3>
          </a>
        );
      })}
    </div>
  );
}
