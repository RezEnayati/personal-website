import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ParticleName } from '@/components/three/ParticleName';
import { FloatingGeometry, FloatingTorus } from '@/components/three/FloatingGeometry';
import { useMousePosition } from '@/hooks/useMousePosition';
import { cn } from '@/lib/utils';

const buttonStyles = {
  base: 'relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cyan)] focus-visible:ring-offset-2 text-lg px-8 py-4 rounded-2xl',
  primary: 'bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white hover:shadow-lg hover:shadow-[var(--color-accent-cyan)]/25',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-cyan)] hover:bg-[var(--color-surface-hover)]',
};

export function Hero() {
  const [isHovered, setIsHovered] = useState(false);
  const mouse = useMousePosition();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Three.js Canvas */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ParticleName
              text="REZA ENAYATI"
              mousePosition={{ x: mouse.normalizedX, y: mouse.normalizedY }}
              isHovered={isHovered}
            />
            <FloatingGeometry position={[-3, 1.5, -2]} scale={0.4} speed={0.5} />
            <FloatingTorus position={[3, -1, -3]} scale={0.5} speed={0.3} />
            <ambientLight intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Interactive hover area */}
        <div
          className="inline-block cursor-pointer mb-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight opacity-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
          >
            REZA ENAYATI
          </motion.h1>
        </div>

        <motion.p
          className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          i really like to code.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.a
            href="mailto:r3zsoft@gmail.com"
            className={cn(buttonStyles.base, buttonStyles.primary)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            contact
          </motion.a>
          <motion.a
            href="/resume.pdf"
            download="Reza_Enayati_Resume.pdf"
            className={cn(buttonStyles.base, buttonStyles.secondary)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            resume
          </motion.a>
          <motion.a
            href="https://calendly.com/rezae/30min"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonStyles.base, buttonStyles.secondary)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            meet
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-[var(--color-border)] rounded-full flex justify-center"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-[var(--color-accent-cyan)] rounded-full mt-2"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
