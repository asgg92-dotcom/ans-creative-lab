'use client';

import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';

const COLORS = ['#00f3ff', '#bc13fe', '#ff0055', '#ffd700', '#00ff88', '#ff6b35', '#ff00ff', '#00ffff', '#ffff00'];
const MIN_SIZE = 5;
const ELLIPSE_SEGMENTS = 48;
const EXPLODE_MIN_MS = 1000;
const EXPLODE_MAX_MS = 3000;
const FRAGMENT_COUNT = 12;
const OFFSCREEN_MARGIN = 150;
const FRAGMENT_REDUCE_THRESHOLD = 400; // 바디가 많을 때 파편 수 감소

interface TimedBody extends Matter.Body {
  createdAt?: number;
  explodeAfterMs?: number;
  generation?: number; // 0: 초기 타원, 1~3: 파편(각 1번 더 터짐), 3차 파편은 터지며 사라짐
}

function createEllipseVertices(rx: number, ry: number): Matter.Vector[] {
  const vertices: Matter.Vector[] = [];
  for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
    const angle = (i / ELLIPSE_SEGMENTS) * Math.PI * 2;
    vertices.push({
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry,
    });
  }
  return vertices;
}

function createStarVertices(outerR: number, innerR: number, points: number): Matter.Vector[] {
  const vertices: Matter.Vector[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return vertices;
}

function createPolygonVertices(radius: number, sides: number): Matter.Vector[] {
  const vertices: Matter.Vector[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    vertices.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return vertices;
}

function createRandomFragmentVertices(size: number): Matter.Vector[] {
  const shapes = [
    () => createPolygonVertices(size, 3),
    () => createPolygonVertices(size, 4),
    () => createPolygonVertices(size, 5),
    () => createPolygonVertices(size, 6),
    () => createStarVertices(size, size * 0.5, 4),
    () => createStarVertices(size, size * 0.4, 5),
    () => createStarVertices(size, size * 0.6, 6),
  ];
  return shapes[Math.floor(Math.random() * shapes.length)]();
}

function explodeBody(engine: Matter.Engine, body: Matter.Body, bodyCount: number) {
  const { Composite, Bodies, Body } = Matter;
  const generation = (body as TimedBody).generation ?? 0;

  if (generation >= 3) {
    Composite.remove(engine.world, body);
    return;
  }

  const fragmentCount = bodyCount > FRAGMENT_REDUCE_THRESHOLD
    ? Math.max(4, Math.floor(FRAGMENT_COUNT * 0.5))
    : FRAGMENT_COUNT;

  const pos = body.position;
  const baseSize = Math.max(
    body.circleRadius ?? 20,
    (body.bounds.max.x - body.bounds.min.x + body.bounds.max.y - body.bounds.min.y) / 4
  );

  const fragments: Matter.Body[] = [];
  for (let i = 0; i < fragmentCount; i++) {
    const size = baseSize * (0.15 + Math.random() * 0.35);
    const vertices = createRandomFragmentVertices(size);
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    const fragment = Bodies.fromVertices(pos.x + offsetX, pos.y + offsetY, [vertices], {
      restitution: 0.8,
      friction: 0.1,
      frictionAir: 0.01,
      render: {
        fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)],
        strokeStyle: 'rgba(255,255,255,0.5)',
        lineWidth: 1,
      },
    });
    if (fragment) {
      const angle = (i / fragmentCount) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 8 + Math.random() * 15;
      Body.setVelocity(fragment, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      });
      Body.setAngularVelocity(fragment, (Math.random() - 0.5) * 0.3);
      const parentGen = generation;
      const frag = fragment as TimedBody;
      frag.createdAt = performance.now();
      frag.explodeAfterMs = EXPLODE_MIN_MS + Math.random() * (EXPLODE_MAX_MS - EXPLODE_MIN_MS);
      frag.generation = parentGen + 1;
      fragments.push(fragment);
    }
  }

  Composite.remove(engine.world, body);
  Composite.add(engine.world, fragments);
}

export default function MatterPhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);

  const getCoordsFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { Engine, Composite, Bodies, Events } = Matter;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    Events.on(engine, 'afterUpdate', () => {
      const bodies = Composite.allBodies(engine.world);
      const now = performance.now();
      const h = window.innerHeight;

      // 화면 밖으로 떨어진 바디 제거
      const toRemoveOffscreen = bodies.filter((b) => !b.isStatic && b.position.y > h + OFFSCREEN_MARGIN);
      toRemoveOffscreen.forEach((b) => Composite.remove(engine.world, b));

      const bodiesToCheck = Composite.allBodies(engine.world);
      const toExplode = bodiesToCheck.filter((b) => {
        const tb = b as TimedBody;
        if (tb.createdAt === undefined || tb.explodeAfterMs === undefined) return false;
        if ((tb.generation ?? 0) >= 4) return false;
        return now - tb.createdAt > tb.explodeAfterMs;
      });
      const countBeforeExplode = bodiesToCheck.filter((b) => !b.isStatic).length;
      for (const body of toExplode) {
        explodeBody(engine, body, countBeforeExplode);
      }
    });

    const w = window.innerWidth;
    const h = window.innerHeight;
    const wallThickness = 60;

    const walls = [
      Bodies.rectangle(w / 2, -wallThickness / 2, w + 200, wallThickness, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(w / 2, h + wallThickness / 2, w + 200, wallThickness, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h + 200, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h + 200, { isStatic: true, render: { visible: false } }),
    ];
    Composite.add(engine.world, walls);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      Events.off(engine, 'afterUpdate');
      Engine.clear(engine);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { Engine } = Matter;
    const delta = 1000 / 60;

    let rafId: number;
    let lastTime = 0;

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw);

      const engine = engineRef.current;
      if (engine) {
        const elapsed = lastTime ? time - lastTime : delta;
        lastTime = time;
        Engine.update(engine, Math.min(elapsed, 50));
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      if (engine) {
        const bodies = Matter.Composite.allBodies(engine.world);
        for (const body of bodies) {
          if (body.render.visible === false) continue;
          const pos = body.position;
          const fill = (body.render as { fillStyle?: string }).fillStyle || '#fff';
          const stroke = (body.render as { strokeStyle?: string }).strokeStyle || 'rgba(255,255,255,0.3)';

          ctx.save();

          if (body.circleRadius) {
            ctx.translate(pos.x, pos.y);
            ctx.rotate(body.angle);
            ctx.beginPath();
            ctx.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (body.vertices?.length) {
            ctx.beginPath();
            ctx.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (let i = 1; i < body.vertices.length; i++) {
              ctx.lineTo(body.vertices[i].x, body.vertices[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      if (dragStartRef.current && dragCurrentRef.current) {
        const s = dragStartRef.current;
        const e = dragCurrentRef.current;
        const rx = Math.max(MIN_SIZE, Math.abs(e.x - s.x) / 2);
        const ry = Math.max(MIN_SIZE, Math.abs(e.y - s.y) / 2);
        const cx = (s.x + e.x) / 2;
        const cy = (s.y + e.y) / 2;

        ctx.strokeStyle = 'rgba(0,243,255,0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x), Math.abs(e.y - s.y));
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    draw(0);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const onPointerDown = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getCoordsFromClient(clientX, clientY);
      if (!pos) return;
      isDraggingRef.current = true;
      dragStartRef.current = pos;
      dragCurrentRef.current = pos;
    },
    [getCoordsFromClient]
  );

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const pos = getCoordsFromClient(clientX, clientY);
      if (!pos) return;
      dragCurrentRef.current = pos;
    },
    [getCoordsFromClient]
  );

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      onPointerDown(e.clientX, e.clientY);
    },
    [onPointerDown]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    },
    [onPointerMove]
  );

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [onPointerDown]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [onPointerMove]
  );

  const onPointerUp = useCallback(() => {
    if (!isDraggingRef.current || !dragStartRef.current || !dragCurrentRef.current || !engineRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      return;
    }

    const s = dragStartRef.current;
    const e = dragCurrentRef.current;
    const rx = Math.max(MIN_SIZE, Math.abs(e.x - s.x) / 2);
    const ry = Math.max(MIN_SIZE, Math.abs(e.y - s.y) / 2);
    const cx = (s.x + e.x) / 2;
    const cy = (s.y + e.y) / 2;

    if (rx >= MIN_SIZE && ry >= MIN_SIZE) {
      const renderOpts = {
        fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)],
        strokeStyle: 'rgba(255,255,255,0.3)',
        lineWidth: 2,
      };
      let body: Matter.Body | null = null;
      const vertices = createEllipseVertices(rx, ry);
      body = Matter.Bodies.fromVertices(cx, cy, [vertices], {
        restitution: 0.4,
        friction: 0.3,
        frictionAir: 0.01,
        render: renderOpts,
      });
      if (!body) {
        body = Matter.Bodies.circle(cx, cy, Math.max(rx, ry), {
          restitution: 0.4,
          friction: 0.3,
          frictionAir: 0.01,
          render: renderOpts,
        });
      }
      if (body) {
        const tb = body as TimedBody;
        tb.createdAt = performance.now();
        tb.explodeAfterMs = EXPLODE_MIN_MS + Math.random() * (EXPLODE_MAX_MS - EXPLODE_MIN_MS);
        tb.generation = 0;
        Matter.Composite.add(engineRef.current.world, body);
      }
    }

    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
  }, []);

  const onMouseUp = useCallback(() => onPointerUp(), [onPointerUp]);
  const onTouchEnd = useCallback(() => onPointerUp(), [onPointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block cursor-crosshair select-none touch-none"
      style={{ display: 'block', touchAction: 'none' }}
    />
  );
}
