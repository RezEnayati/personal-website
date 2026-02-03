export interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  dateRange: string;
  startDate: Date;
  endDate: Date | null;
  type: 'full-time' | 'internship';
  achievements?: string[];
}

export const experiences: Experience[] = [
  {
    id: 'koderai-mts',
    title: 'Member of Technical Staff',
    company: 'koderAI',
    description: 'Building the world\'s first AI multi-agent coder',
    dateRange: 'Sep 2025 - Present',
    startDate: new Date('2025-09-01'),
    endDate: null,
    type: 'full-time',
    achievements: [
      'Leading development of multi-agent AI coding system',
      'Architecting core AI infrastructure',
    ],
  },
  {
    id: 'koderai-intern',
    title: 'Software Engineering Intern',
    company: 'koderAI',
    description: 'Developed core AI components for automated code generation',
    dateRange: 'Jun 2025 - Sep 2025',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-09-01'),
    type: 'internship',
    achievements: [
      'Built AI-powered code generation pipelines',
      'Implemented automated testing frameworks',
    ],
  },
  {
    id: 'djai-intern',
    title: 'Software Engineering Intern',
    company: 'DJAI',
    description: 'Developed ML-powered tools for DJ software',
    dateRange: 'Jun 2024 - Sep 2024',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-09-01'),
    type: 'internship',
    achievements: [
      'Built machine learning models for audio analysis',
      'Integrated ML predictions into DJ software',
    ],
  },
];
