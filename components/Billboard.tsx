"use client";

import useBillboard from "@/hooks/useBillbord";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsFillPlayFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
import { useRouter } from "next/router";
import axios from "axios";

import "@vidstack/react/player/styles/base.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import NoData from "./NoData";
import Loader from "./Loader";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";
import { useSelectionStore } from "@/zustand/useSelectStore";

const GLYPH_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]";

function useScrambleDecipher(target: string, options?: { delay?: number; duration?: number; speed?: number }) {
  const { delay = 800, duration = 1200, speed = 35 } = options ?? {};
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
  }, [target, delay, duration, speed]);

  return { display, isRevealed };
}

const Billboard = () => {
  const { data, isLoading } = useBillboard();
  const router = useRouter();

  // Kept for any external reads, but setup/teardown of listeners now lives
  // entirely inside the callback ref below (see setContainerRef).
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  // Gate the entrance reveals until one frame AFTER the content has data and has
  // painted. Starting the CSS animations at mount lets their timed delays elapse
  // during the hard-load main-thread storm (hydration + video init) before the
  // first paint, so `forwards` snaps to the end state and nothing animates.
  const [entered, setEntered] = useState(false);

  const { profile } = useSelectionStore();
  const { data: currentUser, mutate: mutateUser } = useCurrentUser();
  const { data: favMovies, mutate: mutateFavourite } = useFavourites({
    profileId: profile?.id,
  });

  const isFavourite = useMemo(() => {
    if (!data?.id || !Array.isArray(favMovies)) return false;
    return favMovies.some((m: any) => m?.id === data.id);
  }, [favMovies, data?.id]);

  const toggleFavourite = useCallback(async () => {
    if (!data?.id) return;

    const isProfileMode = !!profile?.id;
    const url = isProfileMode
      ? `/api/favourite?email=${currentUser?.email}&isProfile=true&profileId=${profile?.id}`
      : `/api/favourite?email=${currentUser?.email}`;

    try {
      if (isFavourite) {
        await axios.delete(url, { data: { movieId: data.id } });
      } else {
        await axios.post(url, { movieId: data.id });
      }
      mutateFavourite();
      mutateUser();
    } catch (err) {
      console.log(err);
    }
  }, [data?.id, isFavourite, profile?.id, currentUser?.email, mutateFavourite, mutateUser]);

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
   * IMPORTANT: this used to be a `useRef` + `useEffect(() => {...}, [])` pair.
   * That pattern reads `containerRef.current` exactly once, on the component's
   * very first commit. But this component conditionally renders `<Loader />`
   * while `isLoading` is true — so on a cold load, `containerRef.current` is
   * still `null` when the effect fires, the effect bails out via
   * `if (!el) return;`, and because the deps array is empty it never runs
   * again. Once data arrives and the real container mounts, nothing
   * re-attaches the scroll/mousemove listeners, so the shrink/fade animation
   * silently never activates for that page load.
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
      <NoData variant="movie" title="No movies found" description="Our Team is working on it" />
    );
  }
  if (isLoading) {
    return <Loader />;
  }

  const genres: string[] = (data?.genre || "")
    .split(/[,&/|]/)
    .map((g: string) => g.trim())
    .filter(Boolean);

  const year = data?.createdAt ? new Date(data.createdAt).getFullYear() : null;
  const rating = data?.rating;

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
            alt={data?.title || "thumbnail"}
            className="absolute inset-0 w-full h-full object-cover"
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

      {/* ── Aurora blobs ── */}
      <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none parallax-layer parallax-mid">
        <div className="aurora-blob-1 absolute -bottom-[20%] -left-[10%]" />
        <div className="aurora-blob-2 absolute -top-[10%] -right-[15%]" />
      </div>

      {/* ── Content (scroll parallax + cursor parallax) ── */}
      <div ref={contentRef} className="absolute bottom-8 md:bottom-[25%] left-4 md:left-16 right-4 md:right-auto max-w-2xl z-[10] parallax-layer parallax-fg will-change-transform">
        {/* Badge + rating */}
        <div className="flex items-center gap-4 mb-5 opacity-0" style={reveal(0.5)}>
          <span className="liquid-glass relative bg-gradient-to-r from-fuchsia-500/80 to-purple-600/80 text-white text-[11px] md:text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase shadow-lg shadow-fuchsia-500/20">
            Flixo Original
          </span>
          {rating && (
            <span className="flex items-center gap-1.5 text-white/90 text-sm font-semibold">
              <AiFillStar className="text-yellow-400" size={18} />
              {rating} IMDb
            </span>
          )}
        </div>

        {/* Title — Scramble decipher */}
        <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl uppercase leading-[0.95] mb-0">
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

        {/* Description */}
        <p className="hidden sm:block text-neutral-300 text-sm md:text-lg mt-5 max-w-xl leading-relaxed line-clamp-3 opacity-0" style={reveal(1.2)}>
          {data?.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-neutral-300 text-sm md:text-base font-medium opacity-0" style={reveal(1.4)}>
          {genres.map((g, i) => (
            <React.Fragment key={g}>
              {i > 0 && <span className="text-neutral-600">•</span>}
              <span>{g}</span>
            </React.Fragment>
          ))}
          {data?.duration && (
            <>
              <span className="text-neutral-600">•</span>
              <span>{data.duration}</span>
            </>
          )}
          {year && (
            <>
              <span className="text-neutral-600">•</span>
              <span>{year}</span>
            </>
          )}
          <span className="ml-1 border border-white/15 rounded px-1.5 py-0.5 text-xs text-neutral-300 liquid-glass">
            18+
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-9 opacity-0" style={reveal(1.6)}>
          <button
            onClick={() => router.push(`/watch/${data?.id}`)}
            className="btn-rotate-border relative flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:shadow-2xl"
          >
            <BsFillPlayFill size={26} />
            Watch Now
          </button>

          <button
            onClick={toggleFavourite}
            className="liquid-glass relative flex items-center gap-2 bg-white/5 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/10"
          >
            {isFavourite ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
            My List
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billboard;