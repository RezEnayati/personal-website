import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="py-8 border-t border-[var(--color-border)]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          © {currentYear} reza enayati
        </p>
      </div>
    </motion.footer>
  );
}
