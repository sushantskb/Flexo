import React from "react";
import Link from "next/link";
import { Play, Sparkles, Compass } from "lucide-react";

export default function LandingHero() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-dark text-white overflow-hidden flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Background Poster Collage — fills full screen height, anchored right */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Ambient glow blobs — shimmer loop */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-primary/10 blur-[120px] anim-shimmer" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-secondary/10 blur-[120px] anim-shimmer anim-delay-700" />

        {/* Collage image — slide in from right on load */}
        <div className="absolute right-0 top-0 w-full lg:w-[70%] h-full anim-slide-right">
          <img
            src="/images/landing/landing_page_hero.png"
            alt="Movie Poster Collage"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Left → Right dark fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-dark via-neutral-dark/95 to-neutral-dark/30 z-[1]" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent z-[1]" />
        {/* Mobile overall dark wash for text contrast */}
        <div className="absolute inset-0 bg-neutral-dark/70 lg:hidden z-[1]" />
      </div>

      {/* Header Navigation — fade down */}
      <header className="relative w-full px-8 md:px-16 lg:px-24 py-6 flex items-center justify-between z-10 anim-fade-in">
        {/* Logo */}
        <Link href="/" className="group focus:outline-none" id="landing-logo-link">
          <div className="relative h-10 md:h-12 w-28 md:w-36 overflow-hidden flex items-center justify-center">
            <img
              src="/logo_transparent.png"
              alt="Flixo Logo"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 md:w-34 h-28 md:h-34 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.05] select-none"
            />
          </div>
        </Link>

        {/* Centre Feature Pill */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-semibold text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          Movies · Series · Anime · Originals — all in one place
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden sm:inline-block text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-200 focus:outline-none"
            id="landing-signin-link"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-200 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
            id="landing-getstarted-btn"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content Section — staggered slide-up */}
      <main className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-16 flex-1 flex flex-col justify-center max-w-4xl">
        <div className="space-y-6 md:space-y-8">
          {/* New Release Tag — first to appear */}
          <div className="flex items-center gap-3 anim-fade-up anim-delay-200">
            <span className="bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md shadow-primary/10">
              New Release
            </span>
            <span className="text-xs md:text-sm font-semibold italic text-warm-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
              Watch in 4K HDR
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white anim-fade-up anim-delay-300">
            Unlimited
            <br />
            Entertainment.
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent drop-shadow-sm">
              One Subscription.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-warm-text text-sm md:text-base leading-relaxed max-w-xl anim-fade-up anim-delay-400">
            Watch blockbuster movies, binge-worthy series, anime, documentaries, live sports, and exclusive originals in stunning 4K. Anywhere, anytime.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2 anim-fade-up anim-delay-500">
            <Link
              href="/auth"
              className="flex items-center gap-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-extrabold text-sm md:text-base px-8 py-4 rounded-full shadow-xl shadow-primary/10 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-secondary/50 group"
              id="landing-start-watching-btn"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              Start Watching
            </Link>

            <Link
              href="/auth"
              className="flex items-center gap-2.5 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-extrabold text-sm md:text-base px-8 py-4 rounded-full backdrop-blur-md shadow-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 group"
              id="landing-explore-btn"
            >
              <Compass className="w-4 h-4 text-zinc-300 group-hover:rotate-45 transition-transform duration-300" />
              Explore Library
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

