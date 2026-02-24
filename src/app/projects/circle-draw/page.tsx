'use client';

import dynamic from 'next/dynamic';

const MatterPhysicsCanvas = dynamic(
  () => import('./MatterPhysicsCanvas'),
  { ssr: false }
);

export default function MatterPhysicsCirclesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative cursor-crosshair">
      <MatterPhysicsCanvas />
    </div>
  );
}
