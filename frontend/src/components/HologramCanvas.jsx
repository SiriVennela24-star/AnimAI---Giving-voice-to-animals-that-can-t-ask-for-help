import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function AnimalModel({ active = true }) {
  const groupRef = useRef();
  const laserRef = useRef();

  useFrame((state) => {
    const { x, y } = state.pointer;
    const t = state.clock.getElapsedTime();

    // Tilt model slightly towards user cursor position
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.4, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.3, 0.08);
      
      // Floating animation
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.12;
    }

    // Laser scanning bar moving up and down
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(t * 2.2) * 1.6;
    }
  });

  return (
    <group>
      {/* 3D Scanning Line */}
      <mesh ref={laserRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 2.5, 32]} />
        <meshBasicMaterial 
          color="#FF007F" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={active ? 0.7 : 0.1}
        />
      </mesh>

      {/* Low Poly Dog Wireframe Model */}
      <group ref={groupRef}>
        {/* Torso */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.9, 0.9]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.5, 0.8, 0.5]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Head */}
        <mesh position={[1.3, 1.1, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.65} />
        </mesh>

        {/* Snout */}
        <mesh position={[1.65, 1.0, 0]}>
          <boxGeometry args={[0.4, 0.35, 0.4]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.7} />
        </mesh>

        {/* Ears */}
        <mesh position={[1.15, 1.5, 0.2]} rotation={[0, 0, Math.PI / 12]}>
          <coneGeometry args={[0.15, 0.45, 4]} />
          <meshBasicMaterial color="#FF007F" wireframe transparent opacity={0.75} />
        </mesh>
        <mesh position={[1.15, 1.5, -0.2]} rotation={[0, 0, Math.PI / 12]}>
          <coneGeometry args={[0.15, 0.45, 4]} />
          <meshBasicMaterial color="#FF007F" wireframe transparent opacity={0.75} />
        </mesh>

        {/* Legs */}
        <mesh position={[0.8, -0.85, 0.3]}>
          <boxGeometry args={[0.25, 1.0, 0.25]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.8, -0.85, -0.35]}>
          <boxGeometry args={[0.25, 1.0, 0.25]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.8, -0.85, 0.35]}>
          <boxGeometry args={[0.25, 1.0, 0.25]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.8, -0.85, -0.35]}>
          <boxGeometry args={[0.25, 1.0, 0.25]} />
          <meshBasicMaterial color="#8A2BE2" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Tail */}
        <mesh position={[-1.2, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.7, 0.15, 0.15]} />
          <meshBasicMaterial color="#FF007F" wireframe transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export default function HologramCanvas({ scanning = true }) {
  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-[#07070F] border border-cyber-violet/20 shadow-inner">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      
      {scanning && <div className="laser-scanner-line" />}

      <div className="absolute top-4 left-4 font-mono text-[9px] text-cyber-violet tracking-wider pointer-events-none select-none">
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta animate-ping" /> 
          TRIAGE_ENG_ACTIVE
        </p>
        <p className="opacity-60">MESH: STRAY_GUARDIAN_3D</p>
      </div>

      <div className="absolute bottom-4 right-4 font-mono text-[9px] text-cyber-magenta tracking-wider pointer-events-none select-none opacity-80">
        <p>MATRIX ROTATION LERP</p>
        <p>NEON SCAN ACTIVE</p>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.8, 3.8]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <AnimalModel active={scanning} />

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
