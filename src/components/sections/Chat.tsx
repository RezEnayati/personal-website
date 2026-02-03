import { motion } from 'framer-motion';
import { ChatContainer } from '@/components/chat';

export function Chat() {
  return (
    <section id="chat" className="py-32 bg-[var(--color-background-secondary)]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Chat with rezai</span>
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            An AI fine-tuned to answer questions about me
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <ChatContainer />
        </motion.div>
      </div>
    </section>
  );
}
