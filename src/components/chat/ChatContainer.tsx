import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chat';
import { sendMessage as sendGradioMessage, initGradioClient } from '@/lib/gradio';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  const { messages, isLoading, addMessage, setLoading, setConnected } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gradio client on mount
  useEffect(() => {
    initGradioClient().then((client) => {
      setConnected(!!client);
    });
  }, [setConnected]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    addMessage({ content, role: 'user' });
    setLoading(true);

    try {
      const response = await sendGradioMessage(content);
      addMessage({ content: response, role: 'assistant' });
    } catch {
      addMessage({
        content: 'Sorry, something went wrong. Please try again later.',
        role: 'assistant',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 glow-gradient" />
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] flex items-center justify-center text-white font-semibold">
            R
          </div>
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-surface)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">rezai</h3>
          <p className="text-xs text-[var(--color-text-muted)]">AI assistant • Online</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                className="text-4xl mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                💬
              </motion.div>
              <p className="text-[var(--color-text-secondary)]">
                Ask me anything about my work or experience
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
