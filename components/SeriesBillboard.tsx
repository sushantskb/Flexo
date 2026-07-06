"use client";

import useSeriesBillboard from "@/hooks/useSeriesBillboard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/router";
import { BsFillPlayFill } from "react-icons/bs";

import "@vidstack/react/player/styles/base.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import Loader from "./Loader";
import NoData from "./NoData";

const GLYPH_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]";

function useScrambleDecipher(target: string, options?: { delay?: number; duration?: number }) {
  const { delay = 800, duration = 1200 } = options ?? {};
  const [display, setDisplay] = useState(() => target.split("").map(() => GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)]));
  const [isRevealed, setIsRevealed] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setDisplay(target.split("").map(() => GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)]));

    const timeout = setTimeout(() => {
      const start = Date.now();
      const totalChars = target.length;
      const charsRevealed = new Set<number>();

      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        setDisplay((prev) =>
          prev.map((_, i) => {
            const charThreshold = (i + 1) / totalChars;
            if (progress >= charThreshold || charsRevealed.has(i)) {
              charsRevealed.add(i);
              return target[i];
            }
            return GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
          })
        );

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setIsRevealed(true);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, delay, duration]);

  return { display, isRevealed };
}

const SeriesBillboard = () => {
  const router = useRouter();
  const { data, isLoading } = useSeriesBillboard();
  const [isLoaded, setIsLoaded] = useState(false);
  // See Billboard.tsx — gate reveals until a frame after content is painted so
  // their timed delays don't elapse during the hard-load main-thread storm.
  const [entered, setEntered] = useState(false);

  // Kept for any external reads, but setup/teardown of listeners now lives
  // entirely inside the callback ref below (see setContainerRef).
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  /* ── Cursor parallax ── */
  const { display: scrambleTitle, isRevealed } = useScrambleDecipher(data?.title || "", { delay: 400, duration: 1400 });

  /* ── Start entrance reveals one frame after content is ready ── */
  useEffect(() => {
    if (!data) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [data]);

  const reveal = (delay: number): React.CSSProperties | undefined =>
    entered
      ? { animation: `revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`, willChange: "opacity, transform" }
      : undefined;

  /* ── Scroll parallax — whole billboard shrinks ── */
  const contentRef = useRef<HTMLDivElement>(null);

  /*
   * IMPORTANT: this used to be a `useRef` + `useEffect(() => {...}, [])` pair
   * (exactly like Billboard.tsx had). That pattern reads `containerRef.current`
   * exactly once, on the component's very first commit. But this component
   * conditionally renders `<Loader />` while `isLoading` is true — so on a
   * cold load, `containerRef.current` is still `null` when the effect fires,
   * the effect bails out via `if (!el) return;`, and because the deps array
   * is empty it never runs again. Once data arrives and the real container
   * mounts, nothing re-attaches the scroll/mousemove listeners, so the
   * shrink/fade animation silently never activates for that page load.
   *
   * Fixing this with a callback ref instead: callback refs fire every time
   * the DOM node is attached OR detached, including the transition from
   * "<Loader/> with no node" to "real container with a node" — so setup runs
   * at the right time regardless of how long data takes to load.
   */
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    // Tear down any previous listeners before attaching to a new node
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    containerRef.current = node;
    if (!node) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const billboardHeight = node.offsetHeight;

        if (scrollY <= 0) {
          node.style.transform = "";
          node.style.opacity = "";
          if (contentRef.current) {
            contentRef.current.style.transform = "";
            contentRef.current.style.opacity = "";
          }
          ticking = false;
          return;
        }

        const progress = Math.min(scrollY / billboardHeight, 1);
        const scale = 1 - progress * 0.4;
        const translateX = progress * -5;
        const opacity = 1 - progress * 0.7;

        node.style.transform = `translate3d(${translateX}vw, 0, 0) scale(${scale})`;
        node.style.transformOrigin = "center top";
        node.style.opacity = String(opacity);

        if (contentRef.current) {
          const contentShift = progress * 80;
          contentRef.current.style.transform = `translate3d(0, ${-contentShift}px, 0)`;
          contentRef.current.style.opacity = String(1 - progress * 1);
        }

        ticking = false;
      });
    };

    const handleMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      node.style.setProperty("--cursor-x", String(x));
      node.style.setProperty("--cursor-y", String(y));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    node.addEventListener("mousemove", handleMove, { passive: true });

    // Run once immediately — covers the case where the node mounts while
    // the page is already mid-scroll (e.g. browser scroll restoration).
    handleScroll();

    cleanupRef.current = () => {
      window.removeEventListener("scroll", handleScroll);
      node.removeEventListener("mousemove", handleMove);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  if (!data && !isLoading) {
    return (
      <NoData
        variant="series"
        title="No series found"
        description="Our team is working on bringing series content soon."
      />
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  const handleAction = () => {
    if (data?.id) {
      router.push(`/series/${data.id}`);
    }
  };

  const seasonCount = data?.seasons?.length ?? 0;

  return (
    <div
      ref={setContainerRef}
      className="relative w-full h-[70vh] md:h-[56.25vw] overflow-hidden scanlines z-0"
    >
      {/* ── Background layer (parallax) ── */}
      <div className="absolute inset-0 parallax-layer parallax-bg will-change-transform">
        {!isLoaded && (
          <img
            src={data?.thumbnailUrl || ""}
            alt="thumbnail"
            className="absolute inset-0 w-full h-full object-cover brightness-[60%]"
          />
        )}

        {data?.trailerUrl && (
          <MediaPlayer
            src={data.trailerUrl}
            autoPlay
            muted
            loop
            playsInline
            crossOrigin
            poster={data?.thumbnailUrl}
            className="w-full h-full object-cover"
            onCanPlay={() => setIsLoaded(true)}
          >
            <MediaProvider
              className={`w-full h-full object-cover brightness-[60%] transition-opacity duration-1000 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </MediaPlayer>
        )}
      </div>

      {/* ── Liquid glass blur veil ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          maskImage: "linear-gradient(to top, black 0%, black 25%, transparent 65%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 25%, transparent 65%)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-xl bg-black/30" />
      </div>

      {/* ── Secondary gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-[3]" />

      {/* ── Aurora blobs ── */}
      <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none parallax-layer parallax-mid">
        <div className="aurora-blob-1 absolute -bottom-[25%] -left-[15%]" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%)" }} />
        <div className="aurora-blob-2 absolute -top-[15%] -right-[20%]" style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%)" }} />
      </div>

      {/* ── Content (scroll parallax + cursor parallax) ── */}
      <div ref={contentRef} className="absolute bottom-8 md:bottom-[25%] left-4 md:left-16 right-4 md:right-auto max-w-xl z-[10] parallax-layer parallax-fg space-y-4 will-change-transform">
        <div className="flex items-center gap-2 opacity-0" style={reveal(0.5)}>
          <span className="liquid-glass relative bg-zinc-800/60 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
            Series
          </span>
          {seasonCount > 0 && (
            <span className="text-gray-300 text-xs md:text-sm">
              {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"}
            </span>
          )}
        </div>

        {/* Title — Scramble decipher */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-xl">
          <span className="sr-only">{data?.title}</span>
          <span aria-hidden="true" className="glitch-text" data-text={scrambleTitle.join("")}>
            {scrambleTitle.map((char: string, i: number) => (
              <span
                key={i}
                className={`inline-block whitespace-pre transition-colors duration-100 ${
                  isRevealed ? "text-white" : "text-fuchsia-400/80"
                }`}
                style={{
                  animationName: "glyphFlicker",
                  animationDuration: "0.2s",
                  animationTimingFunction: "steps(1)",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 30}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        <p className="hidden sm:block text-white text-sm md:text-lg drop-shadow-xl line-clamp-3 opacity-0" style={reveal(1.1)}>
          {data?.description}
        </p>

        <div className="flex items-center gap-3 mt-2 opacity-0" style={reveal(1.3)}>
          {/* Play Button */}
          <button
            onClick={handleAction}
            className="btn-rotate-border relative bg-white rounded-md py-1.5 md:py-2 px-3 md:px-5 text-black text-xs lg:text-lg font-semibold flex flex-row items-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl"
          >
            <BsFillPlayFill size={25} className="mr-1" />
            Play
          </button>

          {/* More Info Button */}
          <button
            onClick={handleAction}
            className="liquid-glass relative flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-md text-sm md:text-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/15"
          >
            <AiOutlineInfoCircle size={20} />
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesBillboard;