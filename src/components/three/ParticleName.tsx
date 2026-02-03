import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNameProps {
  text?: string;
  particleCount?: number;
  mousePosition: { x: number; y: number };
  isHovered: boolean;
}

// Vertex shader for particles
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute vec3 targetPosition;
  attribute float randomOffset;

  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;

    vec3 pos = position;

    // Mouse interaction - particles disperse from mouse
    vec2 mousePos = uMouse * 3.0;
    float distToMouse = distance(pos.xy, mousePos);
    float mouseInfluence = smoothstep(2.0, 0.0, distToMouse) * uHover;

    // Push particles away from mouse
    vec2 pushDir = normalize(pos.xy - mousePos + vec2(0.001));
    pos.xy += pushDir * mouseInfluence * 1.5;
    pos.z += mouseInfluence * 0.5;

    // Add some floating animation
    pos.y += sin(uTime * 2.0 + randomOffset * 6.28) * 0.02 * (1.0 - uHover * 0.5);
    pos.x += cos(uTime * 1.5 + randomOffset * 6.28) * 0.015 * (1.0 - uHover * 0.5);

    // Lerp towards target when not hovered
    pos = mix(pos, targetPosition, (1.0 - uHover) * 0.1);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = 0.8 + 0.2 * sin(uTime * 3.0 + randomOffset * 6.28);
  }
`;

// Fragment shader for particles
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Create circular particles with soft edges
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

export function ParticleName({
  text = 'REZA ENAYATI',
  particleCount = 3000,
  mousePosition,
  isHovered,
}: ParticleNameProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Generate particle positions from text
  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const targetPositions = new Float32Array(particleCount * 3);
    const randomOffsets = new Float32Array(particleCount);

    // Create a canvas to render text and sample particle positions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;

    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const textPixels: { x: number; y: number }[] = [];

    // Sample pixels where text is rendered
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          textPixels.push({
            x: (x / canvas.width - 0.5) * 4,
            y: -(y / canvas.height - 0.5) * 1,
          });
        }
      }
    }

    // Cyan to purple gradient colors
    const cyanColor = new THREE.Color('#06b6d4');
    const purpleColor = new THREE.Color('#a855f7');
    const pinkColor = new THREE.Color('#ec4899');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Pick a random text pixel or random position
      if (textPixels.length > 0 && i < particleCount * 0.8) {
        const pixel = textPixels[Math.floor(Math.random() * textPixels.length)];
        positions[i3] = pixel.x + (Math.random() - 0.5) * 0.05;
        positions[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.05;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2;

        targetPositions[i3] = pixel.x;
        targetPositions[i3 + 1] = pixel.y;
        targetPositions[i3 + 2] = 0;
      } else {
        // Background particles
        positions[i3] = (Math.random() - 0.5) * 6;
        positions[i3 + 1] = (Math.random() - 0.5) * 3;
        positions[i3 + 2] = (Math.random() - 0.5) * 2 - 1;

        targetPositions[i3] = positions[i3];
        targetPositions[i3 + 1] = positions[i3 + 1];
        targetPositions[i3 + 2] = positions[i3 + 2];
      }

      // Gradient color based on x position
      const t = (positions[i3] + 2) / 4;
      const color = new THREE.Color();
      if (t < 0.5) {
        color.lerpColors(cyanColor, purpleColor, t * 2);
      } else {
        color.lerpColors(purpleColor, pinkColor, (t - 0.5) * 2);
      }
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 2;
      randomOffsets[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geo.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 1));

    return geo;
  }, [text, particleCount]);

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Update uniforms
  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uMouse.value.set(
        mousePosition.x * (viewport.width / 2),
        mousePosition.y * (viewport.height / 2)
      );
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        isHovered ? 1 : 0,
        0.1
      );
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
