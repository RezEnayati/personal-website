import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'relative inline-flex items-center justify-center font-medium transition-all duration-300',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cyan)] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      // Variants
      'bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white hover:shadow-lg hover:shadow-[var(--color-accent-cyan)]/25':
        variant === 'primary',
      'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-cyan)] hover:bg-[var(--color-surface-hover)]':
        variant === 'secondary',
      'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)] hover:bg-[var(--color-surface)]':
        variant === 'ghost',
      // Sizes
      'text-sm px-4 py-2 rounded-lg': size === 'sm',
      'text-base px-6 py-3 rounded-xl': size === 'md',
      'text-lg px-8 py-4 rounded-2xl': size === 'lg',
    },
    className
  );

  if (magnetic) {
    return (
      <motion.button
        className={baseStyles}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <button className={baseStyles} {...props}>
      {children}
    </button>
  );
}
