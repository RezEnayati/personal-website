import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type ReactNode, useRef, useState } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
}

export function Card({ children, className, tilt = false, glow = false }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]',
        'transition-colors duration-300 hover:border-[var(--color-border-hover)]',
        glow && 'hover:shadow-lg hover:shadow-[var(--color-accent-cyan)]/10',
        className
      )}
      style={{
        transform: tilt ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      {glow && (
        <div
          className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
