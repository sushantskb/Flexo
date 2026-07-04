import React from "react";
import Link from "next/link";
import { useInView } from "../hooks/useInView";

export default function LandingCTA() {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.15 });
  return (
    <section ref={sectionRef} className="w-full bg-neutral-dark px-8 md:px-16 lg:px-24 py-16 pb-24">
      {/* Centered CTA Card — scale + fade */}
      <div className={`relative mx-auto max-w-7xl bg-gradient-to-br from-[#944e4e] via-[#944e4e]/20 to-[#0c0a0f] border border-white/5 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl overflow-hidden group transition-all duration-1000 ${sectionInView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'}`}>
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-secondary/5 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6 md:space-y-8">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to start your journey?
          </h2>

          {/* Subtitle */}
          <p className="text-warm-text text-sm md:text-base leading-relaxed max-w-xl">
            Join over 50 million subscribers and get access to the world&apos;s best content.
            <br className="hidden sm:inline" /> Cancel anytime. No hidden fees.
          </p>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              href="/auth"
              id="landing-cta-btn"
              className="inline-block bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-extrabold text-sm md:text-base px-10 py-4 rounded-full shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              Get Started Now - $9.99/mo
            </Link>
          </div>

          {/* Footnote */}
          <p className="text-warm-muted text-xs font-semibold tracking-wide">
            7-day free trial for new members.
          </p>
        </div>
      </div>
    </section>
  );
}
