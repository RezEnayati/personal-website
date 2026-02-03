import { motion } from 'framer-motion';
import { skills, skillCategories } from '@/data/skills';

interface SkillBarProps {
  skill: typeof skills[0];
  index: number;
}

function SkillBar({ skill, index }: SkillBarProps) {
  const categoryColor = skillCategories[skill.category].color;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-cyan)] transition-colors">
          {skill.name}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">{skill.level}%</span>
      </div>
      <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

export function Skills() {
  const categories = Object.entries(skillCategories) as [keyof typeof skillCategories, typeof skillCategories[keyof typeof skillCategories]][];

  return (
    <section id="skills" className="py-32 bg-[var(--color-background-secondary)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Technologies I work with
          </p>
        </motion.div>

        {/* Category legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {categories.map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Skills grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map(([categoryKey, { label }]) => (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]"
            >
              <h3 className="text-lg font-semibold mb-6 text-[var(--color-text-primary)]">
                {label}
              </h3>
              <div className="space-y-4">
                {skills
                  .filter((skill) => skill.category === categoryKey)
                  .map((skill, index) => (
                    <SkillBar key={skill.id} skill={skill} index={index} />
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
