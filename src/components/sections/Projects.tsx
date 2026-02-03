import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import { Card } from '@/components/ui';

interface ProjectCardProps {
  project: typeof projects[0];
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="h-full p-6 group cursor-pointer hover:border-[var(--color-accent-cyan)] transition-all duration-300"
        tilt
        glow
      >
        {/* Project header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-cyan)] transition-colors">
            {project.title}
          </h3>
          <motion.span
            className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-cyan)] transition-colors"
            whileHover={{ x: 5 }}
          >
            →
          </motion.span>
        </div>

        {/* Description */}
        <p className="text-[var(--color-text-secondary)] mb-6">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-background)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white">
              Featured
            </span>
          </div>
        )}
      </Card>
    </motion.a>
  );
}

export function Projects() {
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Selected work and experiments
          </p>
        </motion.div>

        {/* Featured projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Other projects */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-6 text-[var(--color-text-primary)]">
            Other Projects
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {otherProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={featuredProjects.length + index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
