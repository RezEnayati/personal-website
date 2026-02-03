import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingGeometryProps {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
  distort?: number;
}

export function FloatingGeometry({
  position = [0, 0, 0],
  scale = 1,
  speed = 1,
  distort = 0.3,
}: FloatingGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <MeshDistortMaterial
        color="#06b6d4"
        roughness={0.1}
        metalness={0.8}
        distort={distort}
        speed={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export function FloatingTorus({
  position = [0, 0, 0],
  scale = 1,
  speed = 1,
}: FloatingGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <meshStandardMaterial
        color="#a855f7"
        roughness={0.2}
        metalness={0.9}
        transparent
        opacity={0.4}
        wireframe
      />
    </mesh>
  );
}
