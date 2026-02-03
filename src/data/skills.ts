export interface Skill {
  id: string;
  name: string;
  category: 'ai-ml' | 'languages' | 'frameworks' | 'tools';
  level: number; // 1-100
}

export const skills: Skill[] = [
  // AI/ML
  { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', level: 90 },
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai-ml', level: 85 },
  { id: 'transformers', name: 'Transformers', category: 'ai-ml', level: 88 },
  { id: 'langchain', name: 'LangChain', category: 'ai-ml', level: 85 },
  { id: 'llm-finetuning', name: 'LLM Fine-tuning', category: 'ai-ml', level: 90 },
  { id: 'rag', name: 'RAG', category: 'ai-ml', level: 88 },
  { id: 'embeddings', name: 'Embeddings', category: 'ai-ml', level: 92 },

  // Languages
  { id: 'python', name: 'Python', category: 'languages', level: 95 },
  { id: 'typescript', name: 'TypeScript', category: 'languages', level: 88 },
  { id: 'swift', name: 'Swift', category: 'languages', level: 85 },
  { id: 'javascript', name: 'JavaScript', category: 'languages', level: 90 },

  // Frameworks
  { id: 'react', name: 'React', category: 'frameworks', level: 88 },
  { id: 'nextjs', name: 'Next.js', category: 'frameworks', level: 82 },
  { id: 'fastapi', name: 'FastAPI', category: 'frameworks', level: 90 },
  { id: 'swiftui', name: 'SwiftUI', category: 'frameworks', level: 85 },

  // Tools
  { id: 'git', name: 'Git', category: 'tools', level: 92 },
  { id: 'docker', name: 'Docker', category: 'tools', level: 80 },
  { id: 'vercel', name: 'Vercel', category: 'tools', level: 85 },
  { id: 'huggingface', name: 'HuggingFace', category: 'tools', level: 90 },
];

export const skillCategories = {
  'ai-ml': { label: 'AI / ML', color: '#06b6d4' },
  'languages': { label: 'Languages', color: '#a855f7' },
  'frameworks': { label: 'Frameworks', color: '#ec4899' },
  'tools': { label: 'Tools', color: '#22c55e' },
};
