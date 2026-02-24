'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { LinkItem } from '@/data/links';

interface FallingTextProps {
  links: LinkItem[];
  isExiting?: boolean;
  onAllFallen?: () => void;
}

const GROUND_CATEGORY = 0x0002;

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

const OFF_SCREEN_Y = 500;
const MOBILE_BREAKPOINT = 768;

function getTextDimensions(isMobile: boolean) {
  // 모바일: 실제 글자 크기에 맞춘 최소 충돌 박스 | 데스크톱: 원본 유지
  if (isMobile) {
    return { charWidth: 18, padding: 8, height: 44 };
  }
  return { charWidth: 70, padding: 40, height: 140 };
}

export function FallingText({ links, isExiting = false, onAllFallen }: FallingTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const textBodiesRef = useRef<Matter.Body[]>([]);
  const boundsRef = useRef({ width: 0, height: 0 });
  const isExitingRef = useRef(isExiting);
  const allFallenFiredRef = useRef(false);
  const onAllFallenRef = useRef(onAllFallen);
  // hydration 방지: 마운트 후에만 window 사용 (서버/클라이언트 초기 렌더 일치)
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  isExitingRef.current = isExiting;
  onAllFallenRef.current = onAllFallen;

  useEffect(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Events, Query } = Matter;

    const getBounds = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 0;
      const h = rect?.height ?? 0;
      if (w > 0 && h > 0) return { width: w, height: h };
      return { width: window.innerWidth, height: window.innerHeight };
    };

    const bounds = getBounds();
    boundsRef.current = bounds;

    const { width: W, height: H } = bounds;
    const wallThickness = 2;
    const edgeSlop = 4;
    const _isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    // 중력: 모바일은 느리게, 데스크톱은 기존대로
    engine.gravity.y = _isMobile ? 0.9 : 1.5;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: W,
        height: H,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false,
      },
    });
    renderRef.current = render;

    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.pointerEvents = 'auto';
    render.canvas.style.zIndex = '10';

    const groundHeight = 100;
    const groundOffset = 120; // Shuffle 버튼 위 여유

    const ground = Bodies.rectangle(
      W / 2,
      H - groundOffset,
      W,
      groundHeight,
      {
        isStatic: true,
        render: { visible: false },
        label: 'ground',
        collisionFilter: { category: GROUND_CATEGORY, mask: 0xFFFFFFFF, group: 0 },
      }
    );

    // 좌측 벽: 오른쪽 모서리가 x=-edgeSlop (플레이 영역을 살짝 넓혀 가장자리까지 닿게)
    const leftWall = Bodies.rectangle(
      -edgeSlop - wallThickness / 2,
      H / 2,
      wallThickness,
      H * 2,
      { isStatic: true, render: { visible: false } }
    );

    // 우측 벽: 왼쪽 모서리가 x=W+edgeSlop
    const rightWall = Bodies.rectangle(
      W + edgeSlop + wallThickness / 2,
      H / 2,
      wallThickness,
      H * 2,
      { isStatic: true, render: { visible: false } }
    );

    World.add(world, [ground, leftWall, rightWall]);

    const textBodies: Matter.Body[] = [];
    const { charWidth, padding, height } = getTextDimensions(_isMobile);

    const playWidth = W + edgeSlop * 2;
    links.forEach((link, index) => {
      const linkWidth = link.title.length * charWidth + padding;

      const x = Math.random() * (playWidth - linkWidth) + linkWidth / 2 - edgeSlop;
      const y = -Math.random() * 2000 - 200;

      const body = Bodies.rectangle(x, y, linkWidth, height, {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.01,
        angle: (Math.random() - 0.5) * 0.5,
        label: index.toString(),
      });

      textBodies.push(body);
      World.add(world, body);
    });

    textBodiesRef.current = textBodies;

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    let startPoint = { x: 0, y: 0 };
    let isDragging = false;

    Events.on(mouseConstraint, 'mousedown', () => {
      const mousePosition = mouse.position;
      startPoint = { x: mousePosition.x, y: mousePosition.y };
      isDragging = false;
    });

    const updateHoverAndCursor = () => {
      const mousePosition = mouse.position;
      const hoveredBody = mouseConstraint.body || Query.point(textBodies, mousePosition)[0];
      if (hoveredBody) {
        const idx = parseInt(hoveredBody.label);
        if (!isNaN(idx)) {
          setHoveredIndex(idx);
          render.canvas.style.cursor = mouseConstraint.body ? 'grabbing' : 'grab';
        }
      } else {
        setHoveredIndex(null);
        render.canvas.style.cursor = 'default';
      }
    };

    Events.on(mouseConstraint, 'mousemove', () => {
      const mousePosition = mouse.position;
      const distance = Math.hypot(mousePosition.x - startPoint.x, mousePosition.y - startPoint.y);
      if (distance > 5 && mouseConstraint.body) isDragging = true;
      updateHoverAndCursor();
    });

    Events.on(engine, 'beforeUpdate', updateHoverAndCursor);

    const handleMouseLeave = () => setHoveredIndex(null);
    render.canvas.addEventListener('mouseleave', handleMouseLeave);

    Events.on(mouseConstraint, 'mouseup', () => {
      if (!isDragging) {
        const clickedBody = Query.point(textBodies, mouse.position)[0];
        if (clickedBody) {
          const idx = parseInt(clickedBody.label);
          const link = links[idx];
          if (link) window.open(link.url, '_blank');
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    runnerRef.current = runner;

    // 3초마다 제일 하단 링크가 땅을 관통해 화면 밖으로 떨어지게 함 (테마 전환 중에는 스킵)
    const pushBottomAndRespawn = () => {
      if (isExitingRef.current) return;
      if (mouseConstraint.body) return; // 드래그 중에는 멈춤
      const bottomBody = textBodies.reduce((a, b) =>
        a.position.y > b.position.y ? a : b
      );
      // 이 body만 땅과 충돌하지 않도록 (mask에서 ground 제외), 다른 텍스트와는 충돌 유지
      bottomBody.collisionFilter.mask = 0xFFFFFFFF & ~GROUND_CATEGORY;
      // 자연스러운 추락: 모바일은 느리게
      const fallSpeed = _isMobile ? 3 : 6;
      Matter.Body.setVelocity(bottomBody, {
        x: (Math.random() - 0.5) * (_isMobile ? 2 : 4),
        y: fallSpeed + Math.random() * (_isMobile ? 2 : 4),
      });
      Matter.Body.setAngularVelocity(bottomBody, (Math.random() - 0.5) * (_isMobile ? 0.04 : 0.06));
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

          // 화면 밖(아래)로 나가면 최상단에서 리스폰 (Shuffle 전환 중에는 리스폰 안 함)
          const { height: boundsH, width: boundsW } = boundsRef.current;
          if (boundsH > 0 && y > boundsH + OFF_SCREEN_Y && !isExitingRef.current) {
            const link = links[index];
            const dims = getTextDimensions(window.innerWidth < MOBILE_BREAKPOINT);
            const linkW = link.title.length * dims.charWidth + dims.padding;
            const playW = boundsW + edgeSlop * 2;
            Matter.Body.setPosition(body, {
              x: Math.random() * (playW - linkW) + linkW / 2 - edgeSlop,
              y: -Math.random() * 800 - 200,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
            body.collisionFilter.category = 1;
            body.collisionFilter.mask = 0xFFFFFFFF;
            body.collisionFilter.group = 0;
          }

          domElement.style.transform = `translate(${x - domElement.offsetWidth / 2}px, ${y - domElement.offsetHeight / 2}px) rotate(${rotation}rad)`;
          domElement.style.opacity = '1';
        }
      });

      // Shuffle 전환 중: 모두 떨어졌으면 onAllFallen 콜백 (1회만)
      const { height: boundsH2 } = boundsRef.current;
      if (boundsH2 > 0 && isExitingRef.current && onAllFallenRef.current && !allFallenFiredRef.current) {
        const allOffScreen = textBodies.every((b) => b.position.y > boundsH2 + OFF_SCREEN_Y);
        if (allOffScreen) {
          allFallenFiredRef.current = true;
          onAllFallenRef.current();
        }
      }

      animationId = requestAnimationFrame(updateDOM);
    };
    
    animationId = requestAnimationFrame(updateDOM);

    const handleResize = () => {
      const b = getBounds();
      if (b.width <= 0 || b.height <= 0) return;
      boundsRef.current = b;

      render.canvas.width = b.width;
      render.canvas.height = b.height;

      Matter.Body.setPosition(ground, {
        x: b.width / 2,
        y: b.height - groundOffset,
      });
      Matter.Body.setPosition(leftWall, {
        x: -edgeSlop - wallThickness / 2,
        y: b.height / 2,
      });
      Matter.Body.setPosition(rightWall, {
        x: b.width + edgeSlop + wallThickness / 2,
        y: b.height / 2,
      });
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(wrapperRef.current);

    return () => {
      clearInterval(intervalId);
      ro.disconnect();
      render.canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationId) cancelAnimationFrame(animationId);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [links, isMobile]); // isMobile 변경 시 물리 엔진 재생성

  // Shuffle 테마 전환 시 모든 텍스트 아래로 떨어지게
  useEffect(() => {
    if (!isExiting || textBodiesRef.current.length === 0) return;
    allFallenFiredRef.current = false;

    const isMobileExit = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    textBodiesRef.current.forEach((body) => {
      body.collisionFilter.mask = 0xFFFFFFFF & ~GROUND_CATEGORY;
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * (isMobileExit ? 4 : 6),
        y: (isMobileExit ? 4 : 8) + Math.random() * (isMobileExit ? 3 : 6),
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * (isMobileExit ? 0.05 : 0.08));
    });
  }, [isExiting]);

  return (
    <div ref={wrapperRef} className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={sceneRef} className="absolute inset-0 opacity-0 z-10" />

      {links.map((link, index) => {
        const hoverColor = HOVER_COLORS[index % HOVER_COLORS.length];
        const dims = getTextDimensions(isMobile);
        const estimatedWidth = link.title.length * dims.charWidth + dims.padding;

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
              height: `${dims.height}px`,
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'transform',
              transformOrigin: '50% 50%',
              color: hoveredIndex === index ? hoverColor : 'white',
            }}
          >
            {/* 모바일: 2.5rem, 데스크톱: 8rem (데스크톱 영향 없음) */}
            <h3 className="text-[2rem] md:text-[8rem] font-black tracking-tighter leading-none text-center w-full whitespace-nowrap">
              {link.title}
            </h3>
          </a>
        );
      })}
    </div>
  );
}
