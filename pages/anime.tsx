"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Navbar from "@/components/Navbar";
import InfoModel from "@/components/InfoModel";
import MoviePosterCard from "@/components/MoviePosterCard";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import CategoryTabs from "@/components/CategoryTabs";
import PosterGridSkeleton from "@/components/PosterGridSkeleton";
import Footer from "@/components/Footer";
import NoData from "@/components/NoData";
import Loader from "@/components/Loader";
import useRegions from "@/hooks/useRegions";
import useModelInfo from "@/hooks/useModelInfo";
import { useInView, visitedPaths } from "@/hooks/useInView";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

import "@vidstack/react/player/styles/base.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

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

const TABS = ["All", "Series", "Movies"];

const AnimeHero = ({ item }: { item: any }) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { display: scrambleTitle, isRevealed } = useScrambleDecipher(item?.title || "", { delay: 400, duration: 1400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const billboardHeight = el.offsetHeight;

        if (scrollY <= 0) {
          el.style.transform = "";
          el.style.opacity = "";
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

        el.style.transform = `translate3d(${translateX}vw, 0, 0) scale(${scale})`;
        el.style.transformOrigin = "center top";
        el.style.opacity = String(opacity);

        if (contentRef.current) {
          const contentShift = progress * 80;
          contentRef.current.style.transform = `translate3d(0, ${-contentShift}px, 0)`;
          contentRef.current.style.opacity = String(1 - progress * 1);
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!item) return null;

  const isSeries = item._type === "series";
  const goTo = () =>
    router.push(isSeries ? `/series/${item.id}` : `/watch/${item.id}`);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] md:h-[56.25vw] overflow-hidden scanlines z-0"
    >
      {/* ── Background layer (video / image) ── */}
      <div className="absolute inset-0 parallax-layer parallax-bg will-change-transform">
        {!isLoaded && (
          <img
            src={item.thumbnailUrl || ""}
            alt={item.title || "Featured anime"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {item.trailerUrl && (
          <MediaPlayer
            src={item.trailerUrl}
            autoPlay
            muted
            loop
            playsInline
            crossOrigin
            poster={item.thumbnailUrl}
            className="w-full h-full object-cover"
            onCanPlay={() => setIsLoaded(true)}
          >
            <MediaProvider
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
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
          maskImage: "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-xl bg-black/40" />
      </div>

      {/* ── Secondary gradient veil ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent z-[3]" />

      {/* ── Content ── */}
      <div
        ref={contentRef}
        className="absolute bottom-8 md:bottom-[25%] left-4 md:left-16 right-4 md:right-auto max-w-2xl z-[10] parallax-layer parallax-fg will-change-transform"
      >
        <span className="bg-gradient-to-r from-fuchsia-500/80 to-purple-600/80 text-white text-[11px] md:text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase shadow-lg shadow-fuchsia-500/20">
          Featured Anime
        </span>

        {/* Title — Scramble decipher */}
        <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl uppercase leading-[0.95] mt-5 mb-0">
          <span className="sr-only">{item.title}</span>
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

        {item.description && (
          <p className="hidden sm:block text-neutral-300 text-sm md:text-lg mt-5 max-w-xl leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={goTo}
            className="btn-rotate-border relative flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:shadow-2xl"
          >
            <BsFillPlayFill size={26} />
            {isSeries ? "Watch Now" : "Play"}
          </button>

          <button
            onClick={goTo}
            className="liquid-glass relative flex items-center gap-2 bg-white/5 border border-white/20 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/10"
          >
            <AiOutlineInfoCircle size={20} />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AnimePage() {
  const router = useRouter();
  const hasVisited = visitedPaths.has(router.pathname);
  const [activeTab, setActiveTab] = useState("All");
  const { data: regions = [], isLoading } = useRegions();
  const { isOpen, closeModel } = useModelInfo();
  const [gridRef, isGridInView] = useInView({ threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(hasVisited);

  useEffect(() => {
    if (!hasVisited) {
      setSectionInView(true);
    }
  }, [hasVisited]);

  /* ── Dynamic overlap ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const billboard = section.previousElementSibling as HTMLElement;
        const billboardHeight = billboard?.offsetHeight || window.innerHeight * 0.7;
        const progress = Math.min(Math.max(scrollY / billboardHeight, 0), 1);

        if (progress > 0.5) {
          const overlapProgress = (progress - 0.5) / 0.5;
          section.style.marginTop = `${overlapProgress * -10}rem`;
        } else {
          section.style.marginTop = "0rem";
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Find the "anime" region and split its content by type
  const { series, movies } = useMemo(() => {
    const animeRegion = Array.isArray(regions)
      ? regions.find((r: any) => r.region?.toLowerCase() === "anime")
      : null;

    const series = (animeRegion?.series || []).map((s: any) => ({
      ...s,
      _type: "series",
    }));
    const movies = (animeRegion?.movies || []).map((m: any) => ({
      ...m,
      _type: "movie",
    }));

    return { series, movies };
  }, [regions]);

  const items = useMemo(() => {
    if (activeTab === "Series") return series;
    if (activeTab === "Movies") return movies;
    return [...series, ...movies];
  }, [activeTab, series, movies]);

  const featured = series[0] || movies[0] || null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Loader />
      </>
    );
  }

  return (
    <>
      <InfoModel visible={isOpen} onClose={closeModel} />
      <Navbar />

      {featured ? (
        <AnimeHero item={featured} />
      ) : (
        <div className="h-24" />
      )}

      <div
        ref={sectionRef}
        className={`px-6 md:px-16 pt-10 pb-20 relative z-10 ${hasVisited ? "row-shown" : sectionInView ? "row-enter-active" : "row-enter"}`}
      >
        {/* Section heading */}
        <div className="mb-6 section-title">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            Anime
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5">
            {`${items.length} title${items.length === 1 ? "" : "s"} available`}
          </p>
        </div>

        {/* Type tabs */}
        <CategoryTabs
          categories={TABS}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Grid */}
        {items.length === 0 ? (
          <NoData
            variant="anime"
            title="No anime found"
            description="We couldn't find any anime right now. Please check back later."
            actionLabel="View All"
            onAction={() => setActiveTab("All")}
          />
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {items.map((item: any, i: number) =>
              item._type === "series" ? (
                <SeriesPosterCard
                  key={`s-${item.id}`}
                  data={item}
                  style={
                    hasVisited
                      ? undefined
                      : isGridInView
                      ? { animation: `gridCardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(i * 60, 600)}ms both` }
                      : { opacity: 0 }
                  }
                />
              ) : (
                <MoviePosterCard
                  key={`m-${item.id}`}
                  data={item}
                  style={
                    hasVisited
                      ? undefined
                      : isGridInView
                      ? { animation: `gridCardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(i * 60, 600)}ms both` }
                      : { opacity: 0 }
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
