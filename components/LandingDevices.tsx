import React from "react";
import Link from "next/link";
import { useInView } from "../hooks/useInView";

export default function LandingDevices() {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });
  return (
    <section ref={sectionRef} className="w-full bg-neutral-dark px-8 md:px-16 lg:px-24 py-20">
      {/* Section Header — centred */}
      <div className={`text-center mb-12 space-y-4 transition-all duration-700 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Stream on Any Device
        </h2>
        <p className="text-warm-text text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Compatible with smart TVs, gaming consoles, tablets, and smartphones.
          Enjoy seamless hand-off between all your devices.
        </p>
      </div>

      {/* Device Mockup Image — scale in */}
      <div className={`relative mx-auto max-w-4xl rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/60 bg-[#0e0c0c] transition-all duration-1000 delay-200 ${sectionInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Purple ambient glow behind image */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-primary/10 pointer-events-none z-0" />

        <img
          src="/images/landing/device_mockup.png"
          alt="Flixo streaming on TV, laptop and phone"
          className="relative z-10 w-full h-auto object-cover"
        />
      </div>

      {/* App Store Badges */}
      <div className={`flex flex-wrap items-center justify-center gap-4 mt-10 transition-all duration-700 delay-500 ${sectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* App Store */}
        <Link
          href="/auth"
          id="landing-appstore-btn"
          className="flex items-center gap-3 bg-warm-bg/75 hover:bg-warm-bg border border-white/10 hover:border-white/20 rounded-xl px-6 py-3.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group"
        >
          {/* App store grid icon */}
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="4" height="4" rx="1" />
            <rect x="10" y="2" width="4" height="4" rx="1" />
            <rect x="18" y="2" width="4" height="4" rx="1" />
            <rect x="2" y="10" width="4" height="4" rx="1" />
            <rect x="10" y="10" width="4" height="4" rx="1" />
            <rect x="18" y="10" width="4" height="4" rx="1" />
            <rect x="2" y="18" width="4" height="4" rx="1" />
            <rect x="10" y="18" width="4" height="4" rx="1" />
            <rect x="18" y="18" width="4" height="4" rx="1" />
          </svg>
          <div className="text-left">
            <p className="text-warm-muted text-[10px] uppercase tracking-widest font-semibold leading-none mb-0.5">
              Download on the
            </p>
            <p className="text-white text-base font-bold leading-tight tracking-tight">
              App Store
            </p>
          </div>
        </Link>

        {/* Google Play */}
        <Link
          href="/auth"
          id="landing-googleplay-btn"
          className="flex items-center gap-3 bg-warm-bg/75 hover:bg-warm-bg border border-white/10 hover:border-white/20 rounded-xl px-6 py-3.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group"
        >
          {/* Play icon */}
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5c.5.3.5 1.2 0 1.5L4.5 21c-.5.33-1.5.33-1.5-.5z" />
          </svg>
          <div className="text-left">
            <p className="text-warm-muted text-[10px] uppercase tracking-widest font-semibold leading-none mb-0.5">
              Get it on
            </p>
            <p className="text-white text-base font-bold leading-tight tracking-tight">
              Google Play
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
