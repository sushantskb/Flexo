import React from "react";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";

const LINKS = [
  { label: "About", href: "/" },
  { label: "Careers", href: "/" },
  { label: "Help Center", href: "/" },
  { label: "Privacy", href: "/" },
  { label: "Terms", href: "/" },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-black/40 px-6 md:px-16 py-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Brand + copyright */}
        <div className="text-center md:text-left">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Flixo
            </span>
          </Link>
          <p className="mt-1.5 text-xs font-medium text-neutral-500">
            © {new Date().getFullYear()} Flixo Inc. All rights reserved.
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Language selector */}
        <button className="flex items-center justify-center gap-2.5 text-neutral-300 hover:text-white transition-colors">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <Globe className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">English (US)</span>
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
