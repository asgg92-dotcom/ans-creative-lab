'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { LinkItem } from '@/data/links';

interface FallingShapesProps {
  links: LinkItem[];
}

// 형광/비비드 컬러 팔레트
const SHAPE_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', 
  '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#A2845E', '#8E8E93', '#FFFFFF', '#000000'
];

export function FallingShapes({ links }: FallingShapesProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]); // Anchor -> Div 변경
  
  const [shapeProps, setShapeProps] = useState<{ color: string; size: number }[]>([]);
  const [hoveredLink, setHoveredLink] = useState<LinkItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. 랜덤 속성 생성
  useEffect(() => {
    const props = links.map(() => ({
      color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
      size: Math.floor(Math.random() * 140) + 60, 
    }));
    setShapeProps(props);
  }, [links]);

  // 2. 물리 엔진 설정
  useEffect(() => {
    if (!sceneRef.current || shapeProps.length === 0) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Events, Query, Composite } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    engine.gravity.y = 1.5;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
      },
    });
    renderRef.current = render;

    // Canvas 스타일 설정 (마우스 이벤트 받기 위해)
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.pointerEvents = 'auto'; // 중요: 캔버스가 클릭을 받아야 함
    render.canvas.style.zIndex = '10'; // DOM 요소보다 위에 위치

    // 벽 생성
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

    // 원형 물리 객체 생성
    const shapeBodies: Matter.Body[] = [];

    links.forEach((link, index) => {
      const { size } = shapeProps[index];
      
      const x = Math.random() * (window.innerWidth - size * 4) + size * 2;
      const y = -Math.random() * 800 - 200 - (index * 200); 

      const body = Bodies.circle(x, y, size, {
        restitution: 0.8,
        friction: 0.001,
        frictionAir: 0.005,
        label: index.toString(), // 인덱스를 라벨로 저장
      });

      shapeBodies.push(body);
      World.add(world, body);
    });

    // 마우스 인터랙션 설정
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);

    // *** 이벤트 핸들링 (클릭 & 호버) ***

    // 1. 드래그 여부 판단 변수
    let startPoint = { x: 0, y: 0 };
    let isDragging = false;

    Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      startPoint = { x: mousePosition.x, y: mousePosition.y };
      isDragging = false;
    });

    Events.on(mouseConstraint, 'mousemove', (event) => {
      const mousePosition = event.mouse.position;
      const distance = Math.hypot(mousePosition.x - startPoint.x, mousePosition.y - startPoint.y);
      
      // 드래그 감지 (약간의 움직임은 허용)
      if (distance > 5 && mouseConstraint.body) {
        isDragging = true;
      }
      
      // 호버 감지 (마우스 아래에 있는 물체 찾기)
      // mouseConstraint.body가 있으면 잡고 있는 물체, 없으면 마우스 아래 물체 검색
      const hoveredBody = mouseConstraint.body || Query.point(shapeBodies, mousePosition)[0];
      
      if (hoveredBody) {
        const bodyIndex = parseInt(hoveredBody.label);
        if (!isNaN(bodyIndex) && links[bodyIndex]) {
          setHoveredLink(links[bodyIndex]);
          render.canvas.style.cursor = 'pointer'; 
        }
      } else {
        setHoveredLink(null);
        render.canvas.style.cursor = 'default';
      }
    });

    Events.on(mouseConstraint, 'mouseup', (event) => {
      const mousePosition = event.mouse.position;
      
      // 드래그하지 않았고, 마우스 아래에 물체가 있으면 클릭으로 간주
      if (!isDragging) {
        const clickedBody = Query.point(shapeBodies, mousePosition)[0];
        if (clickedBody) {
          const bodyIndex = parseInt(clickedBody.label);
          const link = links[bodyIndex];
          if (link) {
            window.open(link.url, '_blank');
          }
        }
      }
      // 마우스 떼면 호버 상태 초기화는 하지 않음 (마우스가 여전히 위에 있을 수 있으므로)
    });

    // ------------------------------------

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    runnerRef.current = runner;

    // 3초마다 제일 하단 원이 땅을 관통해 화면 밖으로 떨어지게 함
    const pushBottomAndRespawn = () => {
      const bottomBody = shapeBodies.reduce((a, b) =>
        a.position.y > b.position.y ? a : b
      );
      bottomBody.collisionFilter.mask = 0xFFFFFFFF & ~GROUND_CATEGORY;
      // 자연스러운 추락: 약한 초기 속도 + 각속도(회전) + 미세한 좌우 흔들림
      Matter.Body.setVelocity(bottomBody, {
        x: (Math.random() - 0.5) * 4,
        y: 6 + Math.random() * 4,
      });
      Matter.Body.setAngularVelocity(bottomBody, (Math.random() - 0.5) * 0.08);
    };

    const intervalId = setInterval(pushBottomAndRespawn, 3000);

    // DOM 업데이트 루프
    let animationId: number;
    
    const updateDOM = () => {
      shapeBodies.forEach((body) => {
        const index = parseInt(body.label);
        const domElement = itemRefs.current[index];

        if (domElement && !isNaN(index)) {
          const { x, y } = body.position;
          const rotation = body.angle;
          const radius = shapeProps[index].size;

          // 화면 밖(아래)으로 나가면 최상단에서 리스폰 + 땅 충돌 복구
          if (y > window.innerHeight + 400) {
            Matter.Body.setPosition(body, {
              x: Math.random() * (window.innerWidth - radius * 4) + radius * 2,
              y: -Math.random() * 800 - 200,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            body.collisionFilter.category = 1;
            body.collisionFilter.mask = 0xFFFFFFFF;
            body.collisionFilter.group = 0;
          }
          // 좌우로 나갔을 때도 리스폰
          else if (x < -500 || x > window.innerWidth + 500) {
            Matter.Body.setPosition(body, {
              x: Math.random() * (window.innerWidth - radius * 4) + radius * 2,
              y: -Math.random() * 500 - 200,
            });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            body.collisionFilter.category = 1;
            body.collisionFilter.mask = 0xFFFFFFFF;
            body.collisionFilter.group = 0;
          }

          // DOM 위치 업데이트
          domElement.style.transform = `translate(${x - radius}px, ${y - radius}px) rotate(${rotation}rad)`;
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
  }, [links, shapeProps]); 

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (shapeProps.length === 0) return null;

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-black font-montserrat"
      onMouseMove={handleMouseMove}
    >
      {/* 
        Canvas 컨테이너 (Scene) 
        z-index가 없거나 낮으면 뒤로 숨지만, render.canvas 자체에 z-index: 10을 주었음.
      */}
      <div ref={sceneRef} className="absolute inset-0" />

      {/* 
        실제 DOM 요소들 (공 모양 Div) 
        Canvas보다 뒤에 있어야 하지만(z-0), 
        시각적으로 보여야 하므로 Canvas 배경이 투명해야 함.
        pointer-events-none으로 마우스 이벤트를 Canvas로 통과시킴.
      */}
      {links.map((link, index) => {
        const { color, size } = shapeProps[index];
        const diameter = size * 2;

        return (
          <div 
            key={link.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            className="absolute top-0 left-0 flex items-center justify-center select-none shadow-xl transition-shadow duration-300 pointer-events-none"
            style={{ 
              width: `${diameter}px`,
              height: `${diameter}px`,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0, // 초기값 0, 위치 잡히면 1
              willChange: 'transform',
              zIndex: 5, // Canvas(10)보다는 아래, 배경보다는 위
            }}
          >
            {/* 숫자 */}
            <span className="text-3xl md:text-4xl font-black text-black/40 mix-blend-overlay">
              {index + 1}
            </span>
          </div>
        );
      })}

      {/* 툴팁 */}
      {hoveredLink && (
        <div 
          className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-full mt-[-40px]"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        >
          <h3 className="text-7xl md:text-9xl font-black text-white mix-blend-difference whitespace-nowrap tracking-tighter">
            {hoveredLink.title}
          </h3>
        </div>
      )}
    </div>
  );
}
