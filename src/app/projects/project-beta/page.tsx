'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox, Text, Edges, MeshTransmissionMaterial } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// 3D 카드 컴포넌트
function HoloCard({ position, color, title, delay = 0 }: { position: [number, number, number], color: string, title: string, delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);

  // 애니메이션 (매 프레임 실행)
  useFrame((state, delta) => {
    if (meshRef.current) {
      // 1. 호버 시 부드러운 스케일 업 (Lerp)
      const targetScale = clicked ? 1.1 : (hovered ? 1.05 : 1);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
      
      // 2. 마우스 따라 회전 (Tilt Effect)
      // 마우스 위치에 따라 약간씩 기울어짐
      const tiltX = (state.pointer.y * 0.2); // 상하 기울기
      const tiltY = (state.pointer.x * 0.2); // 좌우 기울기
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tiltX, delta * 2);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, tiltY, delta * 2);
    }
  });

  return (
    <Float 
      speed={2} 
      rotationIntensity={0.1} 
      floatIntensity={0.5} 
      floatingRange={[-0.05, 0.05]}
    >
      <group position={position}>
        <RoundedBox
          ref={meshRef}
          args={[2, 3, 0.2]} // 너비, 높이, 깊이
          radius={0.1} 
          smoothness={4}
          onClick={() => setClick(!clicked)}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
        >
          {/* 유리/얼음 같은 질감 - MeshTransmissionMaterial이 더 사실적임 */}
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.1} // 색수차 효과 (홀로그램 느낌)
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={color}
            roughness={0.1}
            metalness={0.1}
            transmission={1}
          />
          
          {/* 테두리 강조 */}
          <Edges threshold={15} color="white" opacity={0.3} transparent />

          {/* 내부 텍스트 */}
          <Text
            position={[0, 0, 0.11]} // 표면보다 확실히 위로
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff"
          >
            {title}
          </Text>
        </RoundedBox>
      </group>
    </Float>
  );
}

export default function HoloDeckPage() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        {/* 어두운 배경과 대비되는 조명 */}
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ff00ff" />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={1} color="#00ffff" />

        {/* 환경 맵 (반사를 위해 필수 - warehouse가 어두운 분위기에 어울림) */}
        <Environment preset="city" />

        {/* 카드 배치 */}
        <group position={[0, -0.2, 0]}>
            <HoloCard position={[-2.2, 0, 0]} color="#00ffff" title="CYBER" />
            <HoloCard position={[0, 0, 0]} color="#ff00ff" title="PUNK" />
            <HoloCard position={[2.2, 0, 0]} color="#ffff00" title="2077" />
        </group>
      </Canvas>
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono pointer-events-none text-center">
        <h2 className="text-xl font-bold text-white mb-2">HOLO-DECK</h2>
        <p className="text-xs opacity-50">Interactive 3D Glass Cards</p>
      </div>
    </div>
  );
}
