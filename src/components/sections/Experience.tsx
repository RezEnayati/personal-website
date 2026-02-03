import { motion } from 'framer-motion';
import { experiences } from '@/data/experience';
import { Card } from '@/components/ui';

export function Experience() {
  return (
    <section id="experience" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            My career journey in tech
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-accent-cyan)] via-[var(--color-accent-purple)] to-[var(--color-accent-pink)]" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline node */}
              <div className="absolute left-0 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-accent-cyan)] z-10">
                <motion.div
                  className="absolute inset-0 rounded-full bg-[var(--color-accent-cyan)]"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                />
              </div>

              {/* Content */}
              <div
                className={`w-full md:w-[calc(50%-2rem)] ${
                  index % 2 === 0 ? 'md:pr-8 pl-8 md:pl-0' : 'md:pl-8 pl-8'
                }`}
              >
                <Card
                  className="p-6 group hover:border-[var(--color-accent-cyan)] transition-all duration-300"
                  tilt
                  glow
                >
                  {/* Achievement badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] text-xs font-medium mb-4"
                  >
                    <span className="text-sm">
                      {exp.type === 'full-time' ? '🏆' : '🎯'}
                    </span>
                    {exp.type === 'full-time' ? 'Achievement Unlocked' : 'Quest Completed'}
                  </motion.div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-cyan)] transition-colors">
                      {exp.title}
                    </h3>
                  </div>

                  <p className="text-[var(--color-accent-purple)] font-medium mb-2">
                    {exp.company}
                  </p>

                  <p className="text-sm text-[var(--color-text-muted)] mb-3">
                    {exp.dateRange}
                  </p>

                  <p className="text-[var(--color-text-secondary)]">
                    {exp.description}
                  </p>

                  {exp.achievements && (
                    <ul className="mt-4 space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                        >
                          <span className="text-[var(--color-accent-cyan)] mt-1">→</span>
                          {achievement}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
