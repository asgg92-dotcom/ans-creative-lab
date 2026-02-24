'use client';

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { LinkItem } from '@/data/links';

interface RapidCycleProps {
  links: LinkItem[];
  isExiting?: boolean;
  onAllFallen?: () => void;
}

const CYCLE_MS = 120;
const PARTICLE_COUNT = 1200;
const PARTICLE_SIZE = 3;
const EXPLOSION_MAX_DELAY = 20;

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  delay: number;
  duration: number;
}

function createParticles(rect: DOMRect): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 250;
    particles.push({
      id: i,
      x,
      y,
      angle,
      distance,
      delay: Math.random() * EXPLOSION_MAX_DELAY,
      duration: 0.8 + Math.random() * 0.6,
    });
  }
  return particles;
}

export function RapidCycle({ links, isExiting = false, onAllFallen }: RapidCycleProps) {
  const [index, setIndex] = useState(0);
  const textRef = useRef<HTMLHeadingElement>(null);
  const lastRectRef = useRef<DOMRect | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (links.length === 0) return;
    if (isExiting) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % links.length);
    }, CYCLE_MS);

    return () => clearInterval(id);
  }, [links.length, isExiting]);

  useLayoutEffect(() => {
    if (isExiting || !textRef.current) return;
    lastRectRef.current = textRef.current.getBoundingClientRect();
  });

  useEffect(() => {
    if (!isExiting || !onAllFallen) return;

    const totalTime = 1600;
    const timer = setTimeout(() => {
      particlesRef.current = [];
      onAllFallen();
    }, totalTime);

    return () => clearTimeout(timer);
  }, [isExiting, onAllFallen]);

  const handleClick = useCallback(() => {
    if (isExiting) return;
    const link = links[index];
    if (link) window.open(link.url, '_blank');
  }, [links, index, isExiting]);

  if (links.length === 0) return null;

  const currentLink = links[index];

  if (isExiting && particlesRef.current.length === 0 && lastRectRef.current) {
    particlesRef.current = createParticles(lastRectRef.current);
  }

  const particles = particlesRef.current;
  const showParticles = isExiting && particles.length > 0;

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
    >
      {!showParticles && (
        <h2
          ref={textRef}
          className="text-4xl md:text-8xl font-black tracking-tighter text-white text-center px-8 transition-all duration-100 hover:scale-110 hover:text-orange-500 hover:drop-shadow-[0_0_30px_rgba(249,115,22,0.6)] inline-block"
        >
          {currentLink.title}
        </h2>
      )}

      {showParticles &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none bg-white"
            style={{
              left: p.x - PARTICLE_SIZE / 2,
              top: p.y - PARTICLE_SIZE / 2,
              width: PARTICLE_SIZE,
              height: PARTICLE_SIZE,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
              opacity: 0,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay / 1000,
              ease: 'easeOut',
            }}
          />
        ))}
    </div>
  );
}
