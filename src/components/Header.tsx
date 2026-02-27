import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/#work', label: 'Work', isHash: true },
  { href: '/#about', label: 'About', isHash: true },
  { href: '/blog', label: 'Blog', isHash: false },
  { href: 'mailto:r3zsoft@gmail.com', label: 'Contact', isHash: true },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="text-sm font-medium tracking-tight text-[#F5F5F7]">
          Reza Enayati
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isHash ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-[#86868B] hover:text-[#F5F5F7] transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 w-6"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="block h-[1.5px] w-full bg-[#F5F5F7]"
            animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-[1.5px] w-full bg-[#F5F5F7]"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-[1.5px] w-full bg-[#F5F5F7]"
            animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) =>
                link.isHash ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-lg text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
