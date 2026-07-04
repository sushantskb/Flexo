import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, HelpCircle, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/router";

/* ─── Password strength requirement checks ─── */
const requirements = [
  { id: "length",    label: "8+ Characters", test: (p: string) => p.length >= 8 },
  { id: "upper",     label: "Uppercase",     test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",     label: "Lowercase",     test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "Number",        test: (p: string) => /[0-9]/.test(p) },
  { id: "special",   label: "Special Char",  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function NewPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allPassed = requirements.every((r) => r.test(password));

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (!allPassed) {
      setError("Your password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Simulate API call — replace with actual reset-token API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push("/auth");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-auth-primary selection:text-white">

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/landing/landing_page_hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/80 via-neutral-dark/85 to-auth-bg/95 backdrop-blur-[6px]" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between anim-fade-in">
        {/* Logo */}
        <Link href="/" className="group focus:outline-none">
          <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
            <img
              src="/logo_transparent.png"
              alt="Flixo Logo"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02] select-none"
            />
          </div>
        </Link>

        {/* Help button */}
        <button
          title="Help Center"
          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur flex items-center justify-center text-auth-muted hover:text-white transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* ── Main Card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[420px] bg-auth-card/65 border border-white/5 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col gap-6 anim-fade-up anim-delay-100">

          {/* Title */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Create a New Password
            </h1>
            <p className="text-auth-muted text-sm leading-relaxed">
              Set a strong password to protect your cinematic experience.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest">
              New Password
            </label>
            <div className="relative flex items-center bg-[#1c1617] border border-white/5 focus-within:border-auth-primary/30 focus-within:ring-2 focus-within:ring-auth-primary/20 rounded-xl px-4 py-3 transition-all">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-auth-text font-bold text-sm placeholder:text-auth-muted/40 focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-auth-muted hover:text-white transition-colors cursor-pointer ml-2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength checklist — 2-col grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
              {requirements.map((req) => {
                const passed = req.test(password);
                return (
                  <div key={req.id} className="flex items-center gap-1.5">
                    {passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-auth-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-auth-muted/40 flex-shrink-0" />
                    )}
                    <span className={`text-[11px] font-semibold transition-colors ${passed ? "text-auth-primary" : "text-auth-muted/50"}`}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative flex items-center bg-[#1c1617] border border-white/5 focus-within:border-auth-primary/30 focus-within:ring-2 focus-within:ring-auth-primary/20 rounded-xl px-4 py-3 transition-all">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-auth-text font-bold text-sm placeholder:text-auth-muted/40 focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-auth-muted hover:text-white transition-colors cursor-pointer ml-2"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Update Password Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {/* Back to login */}
          <div className="text-center anim-fade-in anim-delay-300">
            <Link
              href="/auth"
              className="text-auth-muted hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-6 px-6 sm:px-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-auth-muted select-none anim-fade-in anim-delay-300">
        <span>© {new Date().getFullYear()} Flixo Streaming. All rights reserved.</span>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Help Center</a>
      </footer>
    </div>
  );
}
