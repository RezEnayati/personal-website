import { useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/hooks/useLenis";
import { useMousePosition } from "@/hooks/useMousePosition";
import { Dashboard } from "@/pages/Dashboard";
import { BlogIndex } from "@/pages/BlogIndex";
import { BlogPost } from "@/pages/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { trackPageView } from "@/lib/analytics";
import type { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/* ── Project Data ── */
const projectCards = [
  {
    num: "01",
    title: "rezai",
    description:
      "Personal AI assistant fine-tuned with Direct Preference Optimization. Trained on custom Q&A data using Llama 3.1 and Unsloth.",
    tech: ["Llama 3.1", "DPO", "Unsloth", "HuggingFace"],
    link: "https://github.com/RezEnayati/RezAI",
    letter: "R",
  },
  {
    num: "02",
    title: "neuralove",
    description:
      "AI-powered dating app using embeddings and RAG for intelligent matching. Built with SwiftUI, Kotlin, and FastAPI.",
    tech: ["SwiftUI", "Kotlin", "FastAPI", "RAG"],
    link: "https://github.com/RezEnayati",
    letter: "N",
  },
  {
    num: "03",
    title: "rezume",
    description:
      "AI resume tailoring tool. Analyzes job descriptions and optimizes resumes using OpenAI embeddings.",
    tech: ["React", "Flask", "OpenAI", "Embeddings"],
    link: "https://github.com/nthPerson/COMP-380_Group_Project",
    letter: "R",
  },
  {
    num: "04",
    title: "word2vec",
    description:
      "Complete word2vec implementation from scratch. Skip-gram with negative sampling in pure NumPy.",
    tech: ["NumPy", "Skip-gram", "NLP"],
    link: "https://github.com/RezEnayati/word2Vec",
    letter: "W",
  },
  {
    num: "05",
    title: "claude central",
    description:
      "Terminal dashboard for managing multiple Claude Code CLI sessions. MTA subway board-inspired UI with real-time status and CPU monitoring.",
    tech: ["Python", "curses", "FastAPI", "AppleScript"],
    link: "https://github.com/RezEnayati/Claude-Central",
    letter: "C",
  },
];

const marqueeItems = [
  "AI",
  "Machine Learning",
  "NLP",
  "LLMs",
  "Fine-tuning",
  "RAG",
  "Embeddings",
  "Computer Vision",
  "Python",
  "PyTorch",
];

/* ── Gradient Divider ── */
function Divider() {
  return (
    <div
      className="w-full h-px"
      style={{
        background:
          "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 50%, transparent)",
      }}
    />
  );
}

/* ── Tech Marquee ── */
function TechMarquee() {
  return (
    <div
      className="overflow-hidden py-16"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 40s linear infinite" }}
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className="mx-10 text-[#48484A] text-sm font-mono uppercase tracking-[0.2em]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Magnetic Link ── */
function MagneticLink({
  children,
  className = "",
  href,
  target,
  rel,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  );
}

/* ── Cursor Spotlight ── */
function CursorSpotlight() {
  const { x, y } = useMousePosition();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 hidden md:block"
      style={{
        background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(209,209,214,0.03), transparent 40%)`,
      }}
    />
  );
}

/* ── Gradient Mesh (Hero Background) ── */
function GradientMesh() {
  const meshRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const blobs = mesh.querySelectorAll<HTMLElement>(".mesh-blob");
    let raf: number;

    const animate = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      blobs.forEach((blob, i) => {
        const multiplier = (i + 1) * 2;
        const offsetX = (mx - 0.5) * multiplier;
        const offsetY = (my - 0.5) * multiplier;
        blob.style.transform = `translate(${offsetX}%, ${offsetY}%)`;
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={meshRef}
      className="absolute inset-0 overflow-hidden gradient-mesh"
    >
      <div
        className="mesh-blob absolute w-[60vw] h-[60vw] rounded-full opacity-[0.07] blur-[120px]"
        style={{
          background: "radial-gradient(circle, #D1D1D6, transparent 70%)",
          top: "-10%",
          right: "-15%",
          animation: "breathe 8s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-blob absolute w-[50vw] h-[50vw] rounded-full opacity-[0.05] blur-[100px]"
        style={{
          background: "radial-gradient(circle, #F5F5F7, transparent 70%)",
          bottom: "0%",
          left: "-10%",
          animation: "breathe 10s ease-in-out infinite 2s",
        }}
      />
      <div
        className="mesh-blob absolute w-[40vw] h-[40vw] rounded-full opacity-[0.04] blur-[80px]"
        style={{
          background: "radial-gradient(circle, #D1D1D6, transparent 70%)",
          top: "30%",
          left: "30%",
          animation: "breathe 12s ease-in-out infinite 4s",
        }}
      />
      <div
        className="mesh-blob absolute w-[35vw] h-[35vw] rounded-full opacity-[0.05] blur-[90px]"
        style={{
          background: "radial-gradient(circle, #F5F5F7, transparent 70%)",
          bottom: "10%",
          right: "10%",
          animation: "breathe 9s ease-in-out infinite 1s",
        }}
      />
    </div>
  );
}

/* ── Text Scramble Hook ── */
function useTextScramble(
  ref: React.RefObject<HTMLElement | null>,
  text: string
) {
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      onEnter: () => {
        if (hasRun.current) return;
        hasRun.current = true;

        let iteration = 0;
        const interval = setInterval(() => {
          el.textContent = text
            .split("")
            .map((char, i) => {
              if (i < iteration) return text[i];
              if (char === " ") return " ";
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

          iteration += 0.4;
          if (iteration >= text.length) {
            el.textContent = text;
            clearInterval(interval);
          }
        }, 30);
      },
    });

    return () => trigger.kill();
  }, [ref, text]);
}

/* ── Stacking Project Card ── */
function StackingCard({
  project,
  index,
}: {
  project: (typeof projectCards)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useTextScramble(titleRef, project.title);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const mm = ScrollTrigger.matchMedia({
      "(min-width: 768px)": function () {
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          pin: true,
          pinSpacing: false,
          end: "+=100%",
        });
      },
    });

    return () => {
      if (mm && typeof mm === "object" && "revert" in mm) {
        (mm as { revert: () => void }).revert();
      }
    };
  }, []);

  /* Staggered content reveal on scroll */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const ctx = gsap.context(() => {
      const elements = inner.querySelectorAll<HTMLElement>(".card-reveal");
      gsap.from(elements, {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: inner,
          start: "top 75%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  /* 3D tilt + letter parallax on hover */
  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(innerRef.current, {
      rotateY: x * 5,
      rotateX: -y * 5,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
    });

    if (letterRef.current) {
      gsap.to(letterRef.current, {
        x: -x * 20,
        y: -y * 20,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  };

  const handleCardMouseLeave = () => {
    if (!innerRef.current) return;
    gsap.to(innerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: "power3.out",
    });
    if (letterRef.current) {
      gsap.to(letterRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className="min-h-screen w-full flex items-center justify-center px-6 py-20 relative"
      style={{ zIndex: index + 1 }}
    >
      {/* Glow orb */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className="w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #D1D1D6, transparent 70%)",
          }}
        />
      </div>

      {/* Card with 3D tilt */}
      <div
        ref={innerRef}
        className="glass-card w-full max-w-5xl mx-auto relative"
        style={{ zIndex: 1, willChange: "transform" }}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="p-8 md:p-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Text side */}
            <div className={index % 2 !== 0 ? "md:order-2" : ""}>
              <p className="card-reveal font-mono text-xs tracking-[0.15em] mb-4 text-[#A1A1A6]">
                {project.num}
              </p>
              <h3
                ref={titleRef}
                className="card-reveal text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em] mb-6"
              >
                {project.title}
              </h3>
              <p className="card-reveal text-[#A1A1A6] max-w-md leading-relaxed">
                {project.description}
              </p>
              <div className="card-reveal flex flex-wrap gap-2 mt-6">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-full border text-[#A1A1A6]"
                    style={{ borderColor: "rgba(255,255,255,0.12)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="card-reveal link-hover-line mt-8 text-sm font-medium text-[#D1D1D6] hover:text-[#F5F5F7] transition-colors"
              >
                View Project
                <span>&rarr;</span>
              </a>
            </div>

            {/* Visual side — letter with parallax */}
            <div
              className={`flex items-center justify-center ${
                index % 2 !== 0 ? "md:order-1" : ""
              }`}
            >
              <div className="relative w-full aspect-square flex items-center justify-center max-w-[400px]">
                <span
                  ref={letterRef}
                  className="text-[clamp(6rem,12vw,12rem)] font-bold leading-none text-[#D1D1D6] will-change-transform"
                >
                  {project.letter}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Philosophy Section ── */
function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".philosophy-word");

      words.forEach((word, i) => {
        gsap.from(word, {
          yPercent: 120,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: word.parentElement,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          delay: i * 0.1,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(209,209,214,0.04), transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative w-full">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <span className="overflow-hidden inline-block">
            <span className="philosophy-word inline-block text-[clamp(2.5rem,7vw,6rem)] font-light tracking-[-0.04em] leading-[1] accent-text">
              Embrace
            </span>
          </span>
          <span className="overflow-hidden inline-block">
            <span className="philosophy-word inline-block text-[clamp(2.5rem,7vw,6rem)] font-bold tracking-[-0.04em] leading-[1] text-[#F5F5F7]">
              creativity.
            </span>
          </span>
          <div className="h-8 md:h-12" />
          <span className="overflow-hidden inline-block md:self-start md:ml-[10%]">
            <span className="philosophy-word inline-block text-[clamp(2rem,5vw,4rem)] font-light tracking-[-0.03em] leading-[1] text-[#86868B]">
              Think of
            </span>
          </span>
          <span className="overflow-hidden inline-block md:self-end md:mr-[5%]">
            <span className="philosophy-word inline-block text-[clamp(2.5rem,7vw,6rem)] font-bold tracking-[-0.04em] leading-[1] accent-text">
              the unthinkable.
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── Home Page ── */
function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLenis();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cinematic hero: clip-mask text reveal
      gsap.from(".hero-word", {
        yPercent: 120,
        duration: 1.4,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.4,
      });

      // Gradient mesh fades in after text
      gsap.from(".gradient-mesh", {
        opacity: 0,
        duration: 2.5,
        ease: "power2.out",
        delay: 0.8,
      });

      // Hero scroll parallax — layers peel apart at different speeds
      gsap.to(".hero-name", {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-subtitle", {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-detail", {
        y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // "Craft" scroll-driven scale compression
      gsap.from(".craft-scale", {
        scale: 1.5,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: ".craft-section",
          start: "top bottom",
          end: "top 40%",
          scrub: true,
        },
      });

      // Work label fade
      gsap.from(".work-label", {
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".work-label",
          start: "top 85%",
        },
      });

      // About section reveals
      gsap.from(".about-label", {
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-label",
          start: "top 85%",
        },
      });

      gsap.utils
        .toArray<HTMLElement>(".about-heading-word")
        .forEach((el, i) => {
          gsap.from(el, {
            yPercent: 120,
            duration: 1.2,
            ease: "power4.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el.parentElement?.parentElement,
              start: "top 80%",
            },
          });
        });

      gsap.from(".about-body", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-body",
          start: "top 85%",
        },
      });

      // Connect CTA
      gsap.from(".connect-title", {
        yPercent: 120,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".connect-title",
          start: "top 85%",
        },
      });

      gsap.from(".connect-buttons", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15,
        scrollTrigger: {
          trigger: ".connect-buttons",
          start: "top 90%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#000] text-[#F5F5F7] min-h-screen">
      <CursorSpotlight />

      {/* ── Hero ── */}
      <section className="hero-section min-h-screen flex items-center relative overflow-hidden">
        <GradientMesh />

        <div className="w-full relative z-20 px-6 md:px-12">
          {/* Name — viewport-filling, staggered */}
          <div className="hero-name">
            <div className="overflow-hidden">
              <h1 className="hero-word text-[clamp(4rem,15vw,14rem)] font-light leading-[0.9] tracking-[-0.05em]">
                Reza
              </h1>
            </div>
            <div className="overflow-hidden md:pl-[18vw]">
              <h1 className="hero-word text-[clamp(4rem,15vw,14rem)] font-light leading-[0.9] tracking-[-0.05em]">
                Enayati
              </h1>
            </div>
          </div>

          {/* Subtitle — asymmetric, different scale */}
          <div className="mt-8 md:mt-12 md:pl-[4vw]">
            <div className="hero-subtitle overflow-hidden">
              <h2 className="hero-word text-[clamp(1.5rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] accent-text">
                AI / ML Engineer
              </h2>
            </div>
            <div className="hero-detail overflow-hidden mt-2 md:pl-[2vw]">
              <p className="hero-word text-[clamp(0.9rem,1.5vw,1.25rem)] font-normal text-[#86868B]">
                at{" "}
                <a
                  href="https://koderai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D1D1D6] hover:text-[#F5F5F7] transition-colors"
                >
                  koderAI
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Work Section Header ── */}
      <section className="craft-section py-32 px-6" id="work">
        <div className="max-w-6xl mx-auto text-center">
          <p className="work-label font-mono text-xs text-[#86868B] tracking-[0.2em] uppercase mb-6">
            Selected Work
          </p>
          <h2 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.9] tracking-[-0.04em] overflow-hidden">
            <span className="craft-scale inline-block origin-center">
              Craft
            </span>
          </h2>
        </div>
      </section>

      {/* ── Stacking Cards ── */}
      <section className="relative">
        {projectCards.map((project, i) => (
          <StackingCard key={project.num} project={project} index={i} />
        ))}
      </section>

      <Divider />

      {/* ── Philosophy ── */}
      <PhilosophySection />

      <Divider />

      {/* ── Tech Marquee ── */}
      <TechMarquee />

      {/* ── About ── */}
      <section
        className="min-h-screen flex items-center px-6 py-32"
        id="about"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 w-full">
          <div>
            <p className="about-label font-mono text-xs text-[#86868B] tracking-[0.2em] uppercase mb-8">
              About
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
              <span className="overflow-hidden inline-block">
                <span className="about-heading-word inline-block">
                  I build things
                </span>
              </span>
              <br />
              <span className="overflow-hidden inline-block">
                <span className="about-heading-word inline-block accent-text">
                  that think.
                </span>
              </span>
            </h2>
          </div>
          <div className="about-body space-y-6 text-[#A1A1A6] leading-relaxed">
            <p>
              AI/ML engineer focused on language models, fine-tuning, and
              building intelligent applications. I enjoy the intersection of
              research and product — taking cutting-edge techniques and making
              them useful.
            </p>
            <p>
              Currently working on multi-agent coding systems at koderAI.
              Previously built ML tools for audio analysis at DJAI.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Connect ── */}
      <section className="px-6 py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-[-0.04em] leading-[1] accent-text mb-12 overflow-hidden">
            <span className="connect-title inline-block">
              Let's build something.
            </span>
          </h2>
          <div className="connect-buttons flex flex-wrap items-center justify-center gap-4">
            <MagneticLink
              href="mailto:r3zsoft@gmail.com"
              className="glass-button text-sm inline-block"
            >
              Email
            </MagneticLink>
            <MagneticLink
              href="https://github.com/rezenayati"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button text-sm inline-block"
            >
              GitHub
            </MagneticLink>
            <MagneticLink
              href="https://linkedin.com/in/rezaenayati"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button text-sm inline-block"
            >
              LinkedIn
            </MagneticLink>
            <MagneticLink
              href="https://calendly.com/rezae/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-button text-sm inline-block"
            >
              Let's Meet
            </MagneticLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function Layout() {
  return (
    <div className="bg-[#000]">
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
