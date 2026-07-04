import React, { useRef, useState, MouseEvent, ReactNode } from "react";
import { Download, Cpu, MonitorPlay } from "lucide-react";
import { useInView } from "../hooks/useInView";

/* ─────────────────────────────────────────
   Spotlight Card — tracks mouse & paints
   a radial glow where the cursor is
───────────────────────────────────────── */
function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(229,9,20,0.12)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotStyle, setSpotStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSpotStyle({
      background: `radial-gradient(400px circle at ${x}px ${y}px, ${glowColor}, transparent 70%)`,
    });
  };

  const handleMouseLeave = () => {
    setSpotStyle({});
  };

  // Grid/outer specific classes stay on outer div, inner content layout classes go to inner div.
  const isColSpan = className.includes("md:col-span-2");
  const outerClass = `relative overflow-hidden bg-warm-bg/85 border border-white/5 rounded-2xl
    transition-all duration-300 hover:border-white/15 hover:shadow-xl hover:shadow-black/30
    hover:-translate-y-[2px] cursor-default ${isColSpan ? "md:col-span-2" : ""}`;

  const innerClass = `relative z-10 h-full ${className.replace("md:col-span-2", "")}`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={outerClass}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl transition-opacity duration-300"
        style={spotStyle}
      />
      {/* Content sits above spotlight */}
      <div className={innerClass}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Count Up Animation Component
   ───────────────────────────────────────── */
interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  format?: boolean;
  startTrigger?: boolean;
}

function CountUp({ end, duration = 2000, suffix = "", format = false, startTrigger = false }: CountUpProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!startTrigger) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startTrigger]);

  return <>{format ? count.toLocaleString() : count}{suffix}</>;
}

/* ─────────────────────────────────────────
   Main Section
   ───────────────────────────────────────── */
export default function LandingBento() {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.05 });
  return (
    <section ref={sectionRef} className="w-full bg-neutral-dark px-8 md:px-16 lg:px-24 py-16">
      {/* Section Title */}
      <div className={`mb-8 text-center transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Why Flixo?</h2>
        <p className="text-warm-muted text-sm mt-2">Everything you need, nothing you don&apos;t.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">

        {/* ── Row 1 Col 1-2: Large Feature Card ── */}
        <div className={`md:col-span-2 transition-all duration-700 delay-100 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SpotlightCard
          className="h-full p-8 flex flex-col items-center text-center md:items-start md:text-left gap-5"
          glowColor="rgba(229,9,20,0.10)"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <MonitorPlay className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              4K Ultra HD &amp; Dolby Atmos
            </h3>
            <p className="text-warm-text text-sm md:text-base leading-relaxed max-w-md">
              Experience cinema-quality picture and sound from the comfort of your couch.
              Our library supports Dolby Vision and HDR10+ for an immersive viewing experience.
            </p>
          </div>
        </SpotlightCard>
        </div>

        {/* ── Row 1 Col 3: Stat — Titles ── */}
        <div className={`transition-all duration-700 delay-200 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SpotlightCard
          className="h-full p-8 flex flex-col items-center justify-center gap-2 min-h-[200px]"
          glowColor="rgba(138,43,226,0.12)"
        >
          <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            <CountUp end={100000} suffix="+" format={true} startTrigger={sectionInView} />
          </span>
          <p className="text-warm-muted text-sm font-semibold uppercase tracking-widest mt-1">
            Titles Available
          </p>
        </SpotlightCard>
        </div>

        {/* ── Row 2 Col 1: Watch Offline ── */}
        <div className={`transition-all duration-700 delay-300 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SpotlightCard
          className="h-full p-8 flex flex-col items-center text-center gap-4 min-h-[200px] justify-center"
          glowColor="rgba(229,9,20,0.10)"
        >
          <div className="w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center">
            <Download className="w-10 h-10 text-warm-text" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-white text-lg font-extrabold tracking-tight">Watch Offline</h3>
            <p className="text-warm-text text-sm leading-relaxed">
              Take your movies on the go without worrying about data.
            </p>
          </div>
        </SpotlightCard>
        </div>

        {/* ── Row 2 Col 2: Stat — Countries ── */}
        <div className={`transition-all duration-700 delay-[400ms] ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SpotlightCard
          className="h-full p-8 flex flex-col items-center justify-center gap-2 min-h-[200px]"
          glowColor="rgba(138,43,226,0.12)"
        >
          <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            <CountUp end={180} suffix="+" startTrigger={sectionInView} />
          </span>
          <p className="text-warm-muted text-sm font-semibold uppercase tracking-widest mt-1">
            Countries Supported
          </p>
        </SpotlightCard>
        </div>

        {/* ── Row 2 Col 3: AI Discovery ── */}
        <div className={`transition-all duration-700 delay-500 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <SpotlightCard
          className="h-full p-8 flex flex-col items-center text-center gap-4 min-h-[200px] justify-center"
          glowColor="rgba(0,114,215,0.12)"
        >
          <div className="w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center">
            <Cpu className="w-10 h-10 text-warm-text" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-white text-lg font-extrabold tracking-tight">AI Discovery</h3>
            <p className="text-warm-text text-sm leading-relaxed">
              Smarter recommendations based on your unique mood.
            </p>
          </div>
        </SpotlightCard>
        </div>

      </div>
    </section>
  );
}
