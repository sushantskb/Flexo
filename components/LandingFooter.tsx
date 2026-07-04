import React from "react";
import Link from "next/link";
import { Globe, Accessibility } from "lucide-react";
import { useInView } from "../hooks/useInView";

export default function LandingFooter() {
  const [footerRef, footerInView] = useInView({ threshold: 0.1 });
  return (
    <footer ref={footerRef} className="w-full bg-neutral-dark border-t border-white/5 text-warm-text px-8 md:px-16 lg:px-24 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Main Grid: 4 columns — each stagger in */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12">
          {/* Column 1: Brand Info */}
          <div className={`flex flex-col items-center text-center md:items-start md:text-left space-y-6 transition-all duration-700 ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link href="/" className="inline-block group focus:outline-none" id="footer-logo-link">
              <div className="relative h-12 w-36 overflow-hidden flex items-center justify-center md:-ml-3">
                <img 
                  src="/logo_transparent.png" 
                  alt="Flixo Logo" 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.05] select-none"
                />
              </div>
            </Link>
            
            <p className="text-warm-muted text-sm leading-relaxed max-w-[240px]">
              The ultimate cinematic experience delivered directly to your screens.
            </p>

            {/* Icon Group */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-warm-muted w-full">
              {/* Accessibility Icon wrapper */}
              <button 
                aria-label="Accessibility"
                id="footer-accessibility-btn"
                className="w-9 h-9 rounded-full bg-zinc-900/60 border border-white/5 hover:border-white/10 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <Accessibility className="w-4.5 h-4.5" />
              </button>

              {/* Text Size Aa Icon wrapper */}
              <button 
                aria-label="Text Size settings"
                id="footer-textsize-btn"
                className="w-9 h-9 rounded-full bg-zinc-900/60 border border-white/5 hover:border-white/10 hover:text-white transition-all flex items-center justify-center font-bold text-xs cursor-pointer select-none"
              >
                Aa
              </button>

              {/* Language Icon wrapper */}
              <button 
                aria-label="Select Language"
                id="footer-lang-btn"
                className="w-9 h-9 rounded-full bg-zinc-900/60 border border-white/5 hover:border-white/10 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <Globe className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Content Links */}
          <div className={`space-y-4 text-center md:text-left transition-all duration-700 delay-[150ms] ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Content
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-warm-muted">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Anime
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Originals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div className={`space-y-4 text-center md:text-left transition-all duration-700 delay-300 ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-warm-muted">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Devices
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div className={`space-y-4 text-center md:text-left transition-all duration-700 delay-500 ${footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-warm-muted">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Cookie Prefs
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors duration-200">
                  Legal Notices
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright info */}
          <p className="text-warm-muted text-xs font-semibold">
            © {new Date().getFullYear()} Flixo Inc. All rights reserved.
          </p>

          {/* Locale and Currency selection info */}
          <div className="flex items-center gap-6 text-warm-muted text-xs font-bold">
            <button 
              id="footer-locale-selector"
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              English (US)
            </button>
            <button 
              id="footer-currency-selector"
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
