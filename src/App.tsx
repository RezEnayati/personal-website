import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/hooks/useLenis";
import { Dashboard } from "@/pages/Dashboard";
import { BlogIndex } from "@/pages/BlogIndex";
import { BlogPost } from "@/pages/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FadeUp } from "@/components/FadeUp";
import { ScrollToTop } from "@/components/ScrollToTop";
import { trackPageView } from "@/lib/analytics";

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
      start: "top 20%",
      onEnter: () => {
        if (!hasExploded) {
          setHasExploded(true);

          const rect = mainBall.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

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
              vy: Math.sin(angle) * speed - 15,
              size: 20 + Math.random() * 40,
            });
          }

          setFallingBalls(balls);
        }
      },
    });

    return () => trigger.kill();
  }, [hasExploded]);

  useEffect(() => {
    if (fallingBalls.length === 0) return;

    const gravity = 0.8;
    const friction = 0.99;
    let balls = [...fallingBalls];

    const animate = () => {
      balls = balls.map((ball) => ({
        ...ball,
        x: ball.x + ball.vx,
        y: ball.y + ball.vy,
        vx: ball.vx * friction,
        vy: ball.vy + gravity,
      }));

      setFallingBalls([...balls]);

      if (balls.some((ball) => ball.y < window.innerHeight + 100)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fallingBalls.length > 0 ? 1 : 0]);

  return (
    <div ref={containerRef} className="pointer-events-none">
      <div
        ref={mainBallRef}
        className={`absolute right-[10vw] top-[30vh] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] min-w-[150px] min-h-[150px] rounded-full bg-[#FFE600] z-10 transition-opacity duration-300 ${hasExploded ? "opacity-0" : "opacity-100"}`}
      />

      {fallingBalls.map((ball) => (
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
      const horizontal = horizontalRef.current;
      if (!horizontal) return;

      const cards = gsap.utils.toArray<HTMLElement>(".card");

      // Horizontal scroll only on desktop
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function () {
          gsap.to(cards, {
            xPercent: -100 * (cards.length - 1),
            ease: "none",
            scrollTrigger: {
              trigger: horizontal,
              pin: true,
              scrub: 1,
              end: () => "+=" + horizontal.offsetWidth * 1.5,
              invalidateOnRefresh: true,
            },
          });
        },
        "(max-width: 767px)": function () {
          cards.forEach((card) => {
            gsap.from(card, {
              opacity: 0,
              y: 40,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
              },
            });
          });
        },
      });

      // Intro animation
      gsap.from(".intro-text", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#f5f5f5] text-black min-h-screen">
      {/* Exploding Ball - hidden on mobile */}
      <div className="hidden md:block">
        <ExplodingBall />
      </div>

      {/* Hero - Intro Card */}
      <section className="min-h-screen flex items-center px-6 relative">
        <div className="max-w-5xl relative z-20 pointer-events-none">
          <h1 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em]">
            Reza Enayati
          </h1>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em] indent-0 md:indent-[15vw]">
            is an AI/ML
          </h2>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em]">
            engineer
          </h2>
          <h2 className="intro-text text-[clamp(2.5rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em] indent-0 md:indent-[10vw]">
            working with{" "}
            <span className="text-[#8B5CF6] pointer-events-auto">koderAI</span>
          </h2>
        </div>
      </section>

      {/* Horizontal Scroll Section (desktop) / Vertical Stack (mobile) */}
      <section
        ref={horizontalRef}
        className="relative overflow-hidden"
        id="work"
      >
        <div className="flex flex-col md:flex-row">
          {/* Card 1 - Projects intro */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center justify-center px-6">
            <div className="max-w-4xl">
              <p className="text-sm text-gray-500 mb-4 tracking-wide">
                Projects
              </p>
              <h2 className="text-[clamp(3rem,10vw,8rem)] font-medium leading-[0.9] tracking-[-0.04em]">
                Craft
              </h2>
            </div>
            <div className="absolute right-[15vw] bottom-[20vh] w-[20vw] h-[20vw] max-w-[250px] max-h-[250px] rounded-full bg-[#FF6B35] hidden md:block" />
          </div>

          {/* Card 2 - rezai */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">01</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  rezai
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  Personal AI assistant fine-tuned with Direct Preference
                  Optimization. Trained on custom Q&A data using Llama 3.1 and
                  Unsloth.
                </p>
                <a
                  href="https://github.com/RezEnayati/RezAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-[#FFE600] rounded-3xl flex items-center justify-center">
                  <span className="text-[clamp(4rem,8vw,8rem)] font-bold">
                    R
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - neuralove */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-[#f5f5f5]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex items-center justify-center order-2 md:order-1">
                <div className="w-full aspect-square bg-[#FF6B35] rounded-3xl flex items-center justify-center">
                  <span className="text-[clamp(4rem,8vw,8rem)] font-bold text-white">
                    N
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center order-1 md:order-2">
                <p className="text-sm text-gray-500 mb-4">02</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  neuralove
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  AI-powered dating app using embeddings and RAG for intelligent
                  matching. Built with SwiftUI, Kotlin, and FastAPI.
                </p>
                <a
                  href="https://github.com/RezEnayati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 4 - rezume */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">03</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  rezume
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  AI resume tailoring tool. Analyzes job descriptions and
                  optimizes resumes using OpenAI embeddings.
                </p>
                <a
                  href="https://github.com/nthPerson/COMP-380_Group_Project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-black rounded-3xl flex items-center justify-center">
                  <span className="text-[clamp(4rem,8vw,8rem)] font-bold text-white">
                    R
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5 - word2vec */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-[#f5f5f5]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex items-center justify-center order-2 md:order-1">
                <div className="w-full aspect-square bg-[#0066FF] rounded-3xl flex items-center justify-center">
                  <span className="text-[clamp(4rem,8vw,8rem)] font-bold text-white">
                    W
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center order-1 md:order-2">
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
                  className="group mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 6 - claude central */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-4">05</p>
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[1] tracking-[-0.03em] mb-6">
                  claude central
                </h3>
                <p className="text-gray-600 max-w-md leading-relaxed">
                  Terminal dashboard for managing multiple Claude Code CLI
                  sessions. MTA subway board-inspired UI with real-time status,
                  CPU monitoring, and session lifecycle management.
                </p>
                <a
                  href="https://github.com/RezEnayati/Claude-Central"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 text-sm font-medium hover:opacity-60 transition-opacity inline-flex items-center gap-2"
                >
                  View Project{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </a>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square bg-[#1a1a2e] rounded-3xl flex items-center justify-center">
                  <span className="text-[clamp(4rem,8vw,8rem)] font-bold text-[#00FF88]">
                    C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 7 - Manifesto */}
          <div className="card min-h-[80vh] md:min-w-screen md:w-screen md:h-screen flex items-center px-6 bg-[#FFE600]">
            <div className="max-w-3xl mx-auto">
              <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.3] tracking-[-0.02em]">
                Make it fast.
                <br />
                Make it beautiful.
                <br />
                Make it intelligent.
                <br />
                Make it useful.
                <br />
                Make it.
                <br />
              </p>
              <p className="mt-12 text-sm text-black/60">2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen flex items-center px-6 py-32" id="about">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <FadeUp>
            <p className="text-sm text-gray-500 mb-8">About</p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              I build things
              <br />
              that think.
            </h2>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                AI/ML engineer focused on language models, fine-tuning, and
                building intelligent applications. I enjoy the intersection of
                research and product—taking cutting-edge techniques and making
                them useful.
              </p>
              <p>
                Currently working on multi-agent coding systems at koderAI.
                Previously built ML tools for audio analysis at DJAI.
              </p>
              <div className="flex gap-6 pt-6">
                <a
                  href="https://github.com/rezenayati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium hover:opacity-60 transition-opacity"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/rezaenayati"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium hover:opacity-60 transition-opacity"
                >
                  LinkedIn
                </a>
                <a
                  href="/resume.pdf"
                  className="text-black font-medium hover:opacity-60 transition-opacity"
                >
                  Resume
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Links Grid */}
      <section className="px-6 py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <p className="text-sm text-gray-500 mb-12">Connect</p>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FadeUp delay={0.05}>
              <a
                href="mailto:r3zsoft@gmail.com"
                className="aspect-auto py-8 md:aspect-square md:py-0 bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                Email
              </a>
            </FadeUp>
            <FadeUp delay={0.1}>
              <a
                href="https://github.com/rezenayati"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-auto py-8 md:aspect-square md:py-0 bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                GitHub
              </a>
            </FadeUp>
            <FadeUp delay={0.15}>
              <a
                href="https://linkedin.com/in/rezaenayati"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-auto py-8 md:aspect-square md:py-0 bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#e5e5e5] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                LinkedIn
              </a>
            </FadeUp>
            <FadeUp delay={0.2}>
              <a
                href="https://calendly.com/rezae/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-auto py-8 md:aspect-square md:py-0 bg-[#FFE600] rounded-2xl flex items-center justify-center text-lg font-medium hover:bg-[#f5d800] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                Meet
              </a>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}

function Layout() {
  return (
    <div className="bg-[#f5f5f5]">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
