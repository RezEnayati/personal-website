export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "rezai",
    title: "rezai",
    description:
      "AI chatbot fine-tuned on personal Q&A data using direct preference optimization",
    tech: ["Llama 3.1", "DPO", "HuggingFace", "Fine-tuning", "Unsloth"],
    link: "https://github.com/RezEnayati/RezAI",
    featured: true,
  },
  {
    id: "neuralove",
    title: "neuralove",
    description: "AI and embeddings powered dating app (in progress)",
    tech: [
      "SwiftUI",
      "Kotlin",
      "FastAPI",
      "Embeddings",
      "OpenAI",
      "Pinecone",
      "RAG",
    ],
    link: "https://github.com/RezEnayati",
    featured: true,
  },
  {
    id: "rezume",
    title: "rezume",
    description:
      "AI-powered resume tailoring tool for job-specific applications",
    tech: ["React", "Flask", "OpenAI", "Embeddings", "Vercel"],
    link: "https://github.com/nthPerson/COMP-380_Group_Project",
    featured: true,
  },
  {
    id: "claude-central",
    title: "claude central",
    description:
      "Terminal-based dashboard for managing multiple Claude Code CLI sessions, styled after an MTA subway arrival board",
    tech: ["Python", "curses", "FastAPI", "AppleScript"],
    link: "https://github.com/RezEnayati/Claude-Central",
    featured: true,
  },
  {
    id: "word2vec",
    title: "word2vec implementation",
    description:
      "Complete word2vec implementation from scratch using skip-gram negative sampling",
    tech: ["NumPy"],
    link: "https://github.com/RezEnayati/word2Vec",
  },
  {
    id: "digit-recognition",
    title: "live digit recognition",
    description:
      "Real-time digit recognition with interactive drawing interface",
    tech: ["TensorFlow", "CNN", "Gradio", "HuggingFace"],
    link: "https://huggingface.co/spaces/rezaenayati/Live_Digit_Recognition_Using_CNN",
  },
  {
    id: "lazyeye",
    title: "lazyeye",
    description: "Blink tracker to help reduce eye fatigue",
    tech: ["SwiftUI", "MVVM", "CoreML"],
    link: "https://github.com/RezEnayati/LazyEye",
  },
  {
    id: "food-cost",
    title: "food cost calculator",
    description:
      "iOS app for calculating food costs with real-time pricing engine",
    tech: ["SwiftUI", "MVVM"],
    link: "https://github.com/RezEnayati/PizzaGuysFoodCost",
  },
];
