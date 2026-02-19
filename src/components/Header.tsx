import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/#work', label: 'Work', isHash: true },
  { href: '/#about', label: 'About', isHash: true },
  { href: '/blog', label: 'Blog', isHash: false },
  { href: 'mailto:r3zsoft@gmail.com', label: 'Contact', isHash: true },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        isHome
          ? 'mix-blend-difference text-white'
          : 'bg-[#f5f5f5]/90 backdrop-blur-md text-black'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="text-sm font-medium tracking-tight">
          Reza Enayati
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isHash ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm hover:opacity-60 transition-opacity"
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
            className="block h-[1.5px] w-full bg-current"
            animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-[1.5px] w-full bg-current"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block h-[1.5px] w-full bg-current"
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
            className={`md:hidden overflow-hidden border-t ${
              isHome
                ? 'border-white/20'
                : 'border-gray-200 bg-[#f5f5f5]/95 backdrop-blur-md'
            }`}
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) =>
                link.isHash ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-lg hover:opacity-60 transition-opacity"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg hover:opacity-60 transition-opacity"
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
