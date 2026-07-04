import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "../hooks/useInView";

const TRENDING_ITEMS = [
  {
    id: 1,
    title: "Nova: Rebirth",
    meta: "Sci-Fi • 2h 15m",
    image: "/images/landing/trending_image1.png",
    badge: "4K",
    isNew: true,
  },
  {
    id: 2,
    title: "The Last Ronin",
    meta: "Anime • Season 2",
    image: "/images/landing/trending_image2.png",
    badge: "HDR",
    isNew: false,
  },
  {
    id: 3,
    title: "Neon Pulse",
    meta: "Action • 1h 50m",
    image: "/images/landing/trending_image1.png",
    badge: "4K",
    isNew: false,
  },
  {
    id: 4,
    title: "Frozen Realms",
    meta: "Documentary • Series",
    image: "/images/landing/trending_image2.png",
    badge: null,
    isNew: false,
  },
  {
    id: 5,
    title: "Shadow Protocol",
    meta: "Thriller • 1h 45m",
    image: "/images/landing/trending_image1.png",
    badge: "HDR",
    isNew: true,
  },
  {
    id: 6,
    title: "Star Odyssey",
    meta: "Sci-Fi • 2h 5m",
    image: "/images/landing/trending_image2.png",
    badge: "4K",
    isNew: false,
  },
  {
    id: 7,
    title: "Iron Veil",
    meta: "Action • 2h",
    image: "/images/landing/trending_image1.png",
    badge: null,
    isNew: true,
  },
  {
    id: 8,
    title: "Eclipse Rising",
    meta: "Drama • Series",
    image: "/images/landing/trending_image2.png",
    badge: "4K",
    isNew: false,
  },
];

export default function LandingTrending() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });

  const SCROLL_AMOUNT = 320;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-neutral-dark py-12 px-8 md:px-16 lg:px-24 overflow-hidden">
      {/* Section Header */}
      <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Trending Now
          </h2>
          {/* Gradient underline */}
          <div className="mt-1.5 h-[3px] w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
        <Link
          href="/auth"
          className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200"
          id="trending-view-all-link"
        >
          View All
        </Link>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          aria-label="Scroll left"
          id="trending-scroll-left"
          className={`
            absolute left-0 top-[45%] -translate-y-1/2 z-20 -translate-x-2
            w-10 h-10 flex items-center justify-center rounded-full
            bg-zinc-900/90 border border-white/10 backdrop-blur-sm
            text-white shadow-xl
            transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-zinc-800
            ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {TRENDING_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] cursor-pointer group/card"
              style={{
                scrollSnapAlign: "start",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${100 + index * 80}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${100 + index * 80}ms`,
              }}
            >
              {/* Poster */}
              <div
                className={`
                  relative w-full aspect-[2/3] rounded-xl overflow-hidden
                  border transition-all duration-300
                  group-hover/card:scale-[1.03] group-hover/card:shadow-2xl group-hover/card:shadow-black/60
                  ${index === 0
                    ? "border-white/30 shadow-lg shadow-black/50"
                    : "border-white/5 hover:border-white/20"}
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                {/* Top-right Quality Badge */}
                {item.badge && (
                  <span className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                    {item.badge}
                  </span>
                )}

                {/* NEW badge */}
                {item.isNew && (
                  <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md shadow-primary/30">
                    NEW
                  </span>
                )}

                {/* Play button on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <Link
                    href="/auth"
                    className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-transform duration-150 hover:scale-110"
                    id={`trending-play-${item.id}`}
                    aria-label={`Play ${item.title}`}
                  >
                    <svg className="w-5 h-5 text-black fill-black ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Card Meta */}
              <div className="mt-3 px-0.5">
                <p className="text-white text-sm font-bold leading-tight truncate group-hover/card:text-zinc-100 transition-colors">
                  {item.title}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          id="trending-scroll-right"
          className={`
            absolute right-0 top-[45%] -translate-y-1/2 z-20 translate-x-2
            w-10 h-10 flex items-center justify-center rounded-full
            bg-zinc-900/90 border border-white/10 backdrop-blur-sm
            text-white shadow-xl
            transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-zinc-800
            ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
