import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { skills, skillCategories } from '@/data/skills';

interface SkillNodeProps {
  skill: typeof skills[0];
  index: number;
  total: number;
  radius: number;
}

function SkillNode({ skill, index, total, radius }: SkillNodeProps) {
  const meshRef = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const categoryColor = skillCategories[skill.category].color;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = Math.cos(angle + time * 0.2) * radius;
      meshRef.current.position.z = Math.sin(angle + time * 0.2) * radius;
      meshRef.current.position.y = Math.sin(time * 0.5 + index) * 0.3;
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.15 + skill.level * 0.002, 16, 16]} />
          <meshStandardMaterial
            color={categoryColor}
            emissive={categoryColor}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Medium.woff"
        >
          {skill.name}
        </Text>
      </Float>
    </group>
  );
}

export function SkillsOrbit() {
  const groupRef = useRef<THREE.Group>(null);

  // Group skills by category and create orbits
  const orbits = useMemo(() => {
    const categories = ['ai-ml', 'languages', 'frameworks', 'tools'] as const;
    return categories.map((cat, i) => ({
      category: cat,
      skills: skills.filter((s) => s.category === cat),
      radius: 2 + i * 0.8,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbit rings */}
      {orbits.map((orbit) => (
        <group key={orbit.category}>
          {/* Orbit ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[orbit.radius - 0.02, orbit.radius + 0.02, 64]} />
            <meshBasicMaterial
              color={skillCategories[orbit.category].color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Skill nodes */}
          {orbit.skills.map((skill, i) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              index={i}
              total={orbit.skills.length}
              radius={orbit.radius}
            />
          ))}
        </group>
      ))}

      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#06b6d4" />
    </group>
  );
}
