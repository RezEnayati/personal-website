import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/hooks/useLenis';
import { Dashboard } from '@/pages/Dashboard';
import { trackPageView } from '@/lib/analytics';

gsap.registerPlugin(ScrollTrigger);

interface FallingBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

function ExplodingBall() {
  const mainBallRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasExploded, setHasExploded] = useState(false);
  const [fallingBalls, setFallingBalls] = useState<FallingBall[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const mainBall = mainBallRef.current;
    if (!mainBall) return;

    const trigger = ScrollTrigger.create({
      trigger: mainBall,
      start: 'top 20%',
      onEnter: () => {
        if (!hasExploded) {
          setHasExploded(true);

          // Get ball position
          const rect = mainBall.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Create falling balls
          const balls: FallingBall[] = [];
          const numBalls = 12;

          for (let i = 0; i < numBalls; i++) {
            const angle = (Math.PI * 2 * i) / numBalls + Math.random() * 0.5;
            const speed = 8 + Math.random() * 12;
            balls.push({
              id: i,
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 15, // Initial upward burst
              size: 20 + Math.random() * 40,
            });
          }

          setFallingBalls(balls);
        }
      },
    });

    return () => trigger.kill();
  }, [hasExploded]);

  // Physics animation for falling balls
  useEffect(() => {
    if (fallingBalls.length === 0) return;

    const gravity = 0.8;
    const friction = 0.99;
    let balls = [...fallingBalls];

    const animate = () => {
      balls = balls.map(ball => ({
        ...ball,
        x: ball.x + ball.vx,
        y: ball.y + ball.vy,
        vx: ball.vx * friction,
        vy: ball.vy + gravity,
      }));

      setFallingBalls([...balls]);

      // Continue animation until balls are off screen
      if (balls.some(ball => ball.y < window.innerHeight + 100)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fallingBalls.length > 0 ? 1 : 0]); // Only run once when balls appear

  return (
    <div ref={containerRef} className="pointer-events-none">
      {/* Main ball - hidden after explosion */}
      <div
        ref={mainBallRef}
        className={`absolute right-[10vw] top-[30vh] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] min-w-[150px] min-h-[150px] rounded-full bg-[#FFE600] z-10 transition-opacity duration-300 ${hasExploded ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Falling balls */}
      {fallingBalls.map(ball => (
        <div
          key={ball.id}
          className="fixed rounded-full bg-[#FFE600] z-10 pointer-events-none"
          style={{
            left: ball.x - ball.size / 2,
            top: ball.y - ball.size / 2,
            width: ball.size,
            height: ball.size,
          }}
        />
      ))}
    </div>
  );
}

function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  useLenis();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scroll
      const horizontal = horizontalRef.current;
      if (!horizontal) return;

      const cards = gsap.utils.toArray<HTMLElement>('.card');

      gsap.to(cards, {
        xPercent: -100 * (cards.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: horizontal,
          pin: true,
          scrub: 2.5,
          end: () => '+=' + horizontal.offsetWidth * 1.5,
        },
      });

      // Intro animation
      gsap.from('.intro-text', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#f5f5f5] text-black min-h-screen">
      {/* Exploding Ball */}
      <ExplodingBall />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference text-white">
        <div className="flex items-center justify-between px-6 py-5">
          <a href="#" className="text-sm font-medium tracking-tight">
            Reza Enayati
          </a>
          <nav className="flex items-center gap-6">
            <a href="#work" className="text-sm hover:opacity-60 transition-opacity">Work</a>
            <a href="#about" className="text-sm hover:opacity-60 transition-opacity">About</a>
            <a href="mailto:r3zsoft@gmail.com" className="text-sm hover:opacity-60 transition-opacity">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero - Intro Card */}
      <section className="min-h-screen flex items-center px-6 relative">
        <div className="max-w-5xl relative z-20 pointer-events-none">
          <h1 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em]">
            Reza Enayati
          </h1>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em] indent-[15vw]">
            is an AI/ML
          </h2>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em]">
            engineer
          </h2>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em] indent-[10vw]">
            working with <span className="text-[#8B5CF6] pointer-events-auto">koderAI</span>
          </h2>
        </div>
      </section>

      {/* Horizontal Scroll Section */}
      <section ref={horizontalRef} className="relative overflow-hidden" id="work">
        <div className="flex">
          {/* Card 1 - Projects intro */}
          <div className="card min-w-screen w-screen h-screen flex items-center justify-center px-6">
            <div className="max-w-4xl">
              <p className="text-sm text-gray-500 mb-4 tracking-wide">Projects</p>
              <h2 className="text-[clamp(3rem,10vw,8rem)] font-medium leading-[0.9] tracking-[-0.04em]">
                Craft
              </h2>
            </div>
            {/* Orange circle accent */}
            <div className="absolute right-[15vw] bottom-[20vh] w-[20vw] h-[20vw] max-w-[250px] max-h-[250px] rounded-full bg-[#FF6B35]" />
          </div>

          {/* Card 2 - rezai */}
          <div className="card min-w-screen w-screen h-screen flex items-center px-6 bg-white">
            <div className="grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">01</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  rezai
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  Personal AI assistant fine-tuned with Direct Preference Optimization.
                  Trained on custom Q&A data using Llama 3.1 and Unsloth.
                </p>
                <a
                  href="https://github.com/RezEnayati/RezAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project →
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-[#FFE600] rounded-3xl flex items-center justify-center">
                  <span className="text-[8rem] font-bold">R</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - neuralove */}
          <div className="card min-w-screen w-screen h-screen flex items-center px-6 bg-[#f5f5f5]">
            <div className="grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-[#FF6B35] rounded-3xl flex items-center justify-center">
                  <span className="text-[8rem] font-bold text-white">N</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">02</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  neuralove
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  AI-powered dating app using embeddings and RAG for intelligent matching.
                  Built with SwiftUI, Kotlin, and FastAPI.
                </p>
                <a
                  href="https://github.com/RezEnayati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project →
                </a>
              </div>
            </div>
          </div>

          {/* Card 4 - rezume */}
          <div className="card min-w-screen w-screen h-screen flex items-center px-6 bg-white">
            <div className="grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">03</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  rezume
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  AI resume tailoring tool. Analyzes job descriptions and optimizes
                  resumes using OpenAI embeddings.
                </p>
                <a
                  href="https://github.com/nthPerson/COMP-380_Group_Project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project →
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-black rounded-3xl flex items-center justify-center">
                  <span className="text-[8rem] font-bold text-white">R</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5 - word2vec */}
          <div className="card min-w-screen w-screen h-screen flex items-center px-6 bg-[#f5f5f5]">
            <div className="grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-[#0066FF] rounded-3xl flex items-center justify-center">
                  <span className="text-[8rem] font-bold text-white">W</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">04</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  word2vec
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  Complete word2vec implementation from scratch. Skip-gram with
                  negative sampling in pure NumPy.
                </p>
                <a
                  href="https://github.com/RezEnayati/word2Vec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project →
                </a>
              </div>
            </div>
          </div>

          {/* Card 6 - Manifesto */}
          <div className="card min-w-screen w-screen h-screen flex items-center px-6 bg-[#FFE600]">
            <div className="max-w-3xl mx-auto">
              <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.3] tracking-[-0.02em]">
                Make it fast.<br />
                Make it beautiful.<br />
                Make it intelligent.<br />
                Make it useful.<br />
                Make it.<br />
              </p>
              <p className="mt-12 text-sm text-black/60">2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen flex items-center px-6 py-32" id="about">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-sm text-gray-500 mb-8">About</p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              I build things<br />that think.
            </h2>
          </div>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              AI/ML engineer focused on language models, fine-tuning, and building
              intelligent applications. I enjoy the intersection of research and
              product—taking cutting-edge techniques and making them useful.
            </p>
            <p>
              Currently working on multi-agent coding systems at koderAI.
              Previously built ML tools for audio analysis at DJAI.
            </p>
            <div className="flex gap-6 pt-6">
              <a href="https://github.com/rezenayati" target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:opacity-60 transition-opacity">
                GitHub
              </a>
              <a href="https://linkedin.com/in/rezaenayati" target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:opacity-60 transition-opacity">
                LinkedIn
              </a>
              <a href="/resume.pdf" className="text-black font-medium hover:opacity-60 transition-opacity">
                Resume
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Links Grid */}
      <section className="px-6 py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-500 mb-12">Connect</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="mailto:r3zsoft@gmail.com"
              className="aspect-square bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              Email
            </a>
            <a
              href="https://github.com/rezenayati"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/rezaenayati"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://calendly.com/rezae/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-[#FFE600] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#f5d800] transition-colors"
            >
              Meet
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <p>© 2026 Reza Enayati</p>
          <p>Los Angeles, CA</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
