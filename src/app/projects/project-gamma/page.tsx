'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { TorusKnot, Environment, Lightformer, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// 재질 이름 목록 업데이트
const MATERIAL_NAMES = [
  'Concrete (Stone)',
  'Wood (Rough)',
  'Rainbow (Iridescent)', // Water -> Rainbow 변경
  'Metal (Chrome)',
  'Fabric (Velvet)',
];

// 1. 리얼한 돌
function RealStone() {
  const props = useTexture({
    map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_diff_1k.jpg',
    normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_nor_gl_1k.jpg',
    roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_rough_1k.jpg',
    displacementMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_layers_02/concrete_layers_02_disp_1k.jpg',
  });

  Object.values(props).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  });

  return (
    <meshStandardMaterial 
      {...props} 
      displacementScale={0.1} 
      envMapIntensity={0.1} 
    />
  );
}

// 2. 리얼한 나무
function RealWood() {
  const props = useTexture({
    map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg',
    normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.jpg',
    roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_cabinet_worn_long/wood_cabinet_worn_long_rough_1k.jpg',
  });

  Object.values(props).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
  });

  return <meshStandardMaterial {...props} envMapIntensity={0.2} />;
}

// 3. 리얼한 무지개 (Iridescent) - [신규]
function RealRainbow() {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      roughness={0.1}
      metalness={0.1}
      transmission={0.2} // 약간 투명
      iridescence={1} // 무지개 반사 효과 활성화
      iridescenceIOR={1.5} // 굴절률
      iridescenceThicknessRange={[100, 800]} // 두께 범위 (색상 변화 결정)
      envMapIntensity={1.0}
      clearcoat={1}
    />
  );
}

// 4. 리얼한 금속
function RealMetal() {
  return (
    <meshStandardMaterial
      color="#aaaaaa"
      metalness={1.0}
      roughness={0.1}
      envMapIntensity={0.8}
    />
  );
}

// 5. 리얼한 천 (벨벳)
function RealFabric() {
  const props = useTexture({
     map: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/fabric_pattern_07/fabric_pattern_07_col_1_1k.jpg',
     normalMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/fabric_pattern_07/fabric_pattern_07_nor_gl_1k.jpg',
     roughnessMap: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/fabric_pattern_07/fabric_pattern_07_rough_1k.jpg',
  });

  Object.values(props).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
  });

  return (
    <meshPhysicalMaterial 
      {...props} 
      roughness={1.0} 
      sheen={1.0} 
      sheenColor="#ffaaaa"
      envMapIntensity={0.1}
    />
  );
}

// 3D 씬 컴포넌트
function Scene({ materialIndex }: { materialIndex: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.02;
      meshRef.current.rotation.y += delta * 0.03;
      
      const { x, y } = state.pointer;
      meshRef.current.rotation.x += y * 0.02;
      meshRef.current.rotation.y += x * 0.02;
    }
  });

  return (
    <>
      <AbstractEnvironment />
      <MouseLight />
      
      <TorusKnot args={[1, 0.35, 256, 64]} ref={meshRef}>
        {materialIndex === 0 && <RealStone />}
        {materialIndex === 1 && <RealWood />}
        {materialIndex === 2 && <RealRainbow />} {/* Water -> Rainbow 교체 */}
        {materialIndex === 3 && <RealMetal />}
        {materialIndex === 4 && <RealFabric />}
      </TorusKnot>

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={0.4} 
          radius={0.4}
        />
      </EffectComposer>
    </>
  );
}

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { viewport, pointer } = useThree();

  useFrame((state) => {
    if (lightRef.current) {
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      lightRef.current.position.set(x, y, 2.5);
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      distance={5}
      decay={2.5}
      intensity={40}
      color="#ffffff" 
    />
  );
}

function AbstractEnvironment() {
  return (
    <Environment resolution={512} environmentIntensity={0.1}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -9]} scale={[10, 10, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[-5, 0, -5]} scale={[10, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1} rotation={[Math.PI / 2, 0, 0]} position={[0, -5, 0]} scale={[10, 10, 1]} />
      </group>
    </Environment>
  );
}

export default function ProjectGamma() {
  const [materialIndex, setMaterialIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMaterialIndex((prev) => (prev + 1) % MATERIAL_NAMES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} gl={{ toneMappingExposure: 0.8 }}>
        <color attach="background" args={['#000000']} />
        <Scene materialIndex={materialIndex} />
      </Canvas>
      
      <div className="fixed bottom-12 w-full text-center pointer-events-none transition-opacity duration-500">
        <p className="text-white/50 text-sm font-mono uppercase tracking-[0.2em]">
          {MATERIAL_NAMES[materialIndex]}
        </p>
      </div>
    </div>
  );
}
