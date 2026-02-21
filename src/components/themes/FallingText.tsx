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

    // 중력 약간 강화
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
    const groundOffset = 120; // Shuffle 버튼 위 여유
    const wallThickness = 200;
    
    const GROUND_CATEGORY = 0x0002;
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - groundOffset, 
      window.innerWidth,
      groundHeight,
      {
        isStatic: true,
        render: { visible: false },
        label: 'ground',
        collisionFilter: { category: GROUND_CATEGORY, mask: 0xFFFFFFFF, group: 0 },
      }
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
      // [롤백] 기존 물리 엔진 설정값 복구
      // 영문 기준 글자당 약 70px, 패딩 40px
      const charWidth = 70;
      const padding = 40;
      const width = link.title.length * charWidth + padding; 
      const height = 140; 
      
      const x = Math.random() * (window.innerWidth - width) + width / 2;
      const y = -Math.random() * 2000 - 200;

      const body = Bodies.rectangle(x, y, width, height, {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.01,
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

    // 3초마다 제일 하단 링크가 땅을 관통해 화면 밖으로 떨어지게 함
    const pushBottomAndRespawn = () => {
      // 제일 하단(body.position.y 최대) 링크 1개 찾기
      const bottomBody = textBodies.reduce((a, b) =>
        a.position.y > b.position.y ? a : b
      );
      // 이 body만 땅과 충돌하지 않도록 (mask에서 ground 제외), 다른 텍스트와는 충돌 유지
      bottomBody.collisionFilter.mask = 0xFFFFFFFF & ~GROUND_CATEGORY;
      // 자연스러운 추락: 약한 초기 속도 + 각속도(회전) + 미세한 좌우 흔들림
      Matter.Body.setVelocity(bottomBody, {
        x: (Math.random() - 0.5) * 4,
        y: 6 + Math.random() * 4,
      });
      Matter.Body.setAngularVelocity(bottomBody, (Math.random() - 0.5) * 0.06);
    };

    const intervalId = setInterval(pushBottomAndRespawn, 3000);

    let animationId: number;
    
    const updateDOM = () => {
      textBodies.forEach((body) => {
        const index = parseInt(body.label);
        const domElement = itemRefs.current[index];

        if (domElement && !isNaN(index)) {
          const { x, y } = body.position;
          const rotation = body.angle;

          // 화면 밖(아래)으로 나가면 최상단에서 리스폰 + 땅 충돌 복구
          if (y > window.innerHeight + 400) {
            const link = links[index];
            const charWidth = 70;
            const padding = 40;
            const width = link.title.length * charWidth + padding;
            Matter.Body.setPosition(body, {
              x: Math.random() * (window.innerWidth - width) + width / 2,
              y: -Math.random() * 800 - 200,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
            // 땅과 다시 충돌하도록 복구 (Matter.js 기본값)
            body.collisionFilter.category = 1;
            body.collisionFilter.mask = 0xFFFFFFFF;
            body.collisionFilter.group = 0;
          }

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
        y: window.innerHeight - groundOffset,
      });
      
      Matter.Body.setPosition(rightWall, {
        x: window.innerWidth + wallThickness / 2,
        y: window.innerHeight / 2,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(intervalId);
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
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={sceneRef} className="absolute inset-0 pointer-events-none opacity-0" />

      {links.map((link, index) => {
        const hoverColor = HOVER_COLORS[index % HOVER_COLORS.length];
        // [롤백] 기존 렌더링 설정값 복구
        const estimatedWidth = link.title.length * 70 + 40;

        return (
          <a
            key={link.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-0 left-0 flex items-center justify-center cursor-pointer select-none transition-colors duration-300 text-white"
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
              e.currentTarget.style.color = ''; 
            }}
          >
            {/* [롤백] 폰트 크기 복구 */}
            <h3 className="text-[5rem] md:text-[8rem] font-black tracking-tighter leading-none text-center w-full whitespace-nowrap">
              {link.title}
            </h3>
          </a>
        );
      })}
    </div>
  );
}
