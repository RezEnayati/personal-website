import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/theme';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#experience', label: 'experience' },
  { href: '#skills', label: 'skills' },
  { href: '#projects', label: 'projects' },
  { href: '#chat', label: 'chat' },
];

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const scrollProgress = useScrollProgress();
  const isScrolled = scrollProgress > 0.02;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'glass py-4' : 'py-6'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <motion.a
          href="#"
          className="text-xl font-semibold gradient-text"
          whileHover={{ scale: 1.05 }}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          reza
        </motion.a>

        <nav className="flex items-center gap-8">
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)] transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <motion.button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)] hover:bg-[var(--color-surface)] transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            <span className="text-lg">
              {theme === 'dark' ? '◐' : '◑'}
            </span>
          </motion.button>
        </nav>
      </div>

      {/* Scroll progress indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)]"
        style={{ width: `${scrollProgress * 100}%` }}
      />
    </motion.header>
  );
}
