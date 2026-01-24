'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function OilBarrel({ fillLevel = 0.5 }: { fillLevel?: number }) {
  const barrelRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (barrelRef.current) {
      barrelRef.current.rotation.y += 0.005;
    }
    if (liquidRef.current) {
      liquidRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Oil Barrel */}
      <mesh ref={barrelRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>

      {/* Liquid inside */}
      <mesh ref={liquidRef} position={[0, -1 + fillLevel * 2, 0]}>
        <cylinderGeometry args={[0.95, 0.95, fillLevel * 2, 32]} />
        <meshStandardMaterial 
          color="#b87333" 
          transparent 
          opacity={0.7}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function OilBarrelScene({ collateralRatio = 150 }: { collateralRatio?: number }) {
  const fillLevel = Math.min(collateralRatio / 200, 1);

  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <OilBarrel fillLevel={fillLevel} />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
