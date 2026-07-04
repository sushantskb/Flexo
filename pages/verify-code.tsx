import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HelpCircle } from "lucide-react";
import axios from "axios";

const CODE_LENGTH = 6;

export default function VerifyCode() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Countdown for resend ── */
  useEffect(() => {
    if (resendCountdown <= 0) {
      setResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /* ── Focus first input on mount ── */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const updated = [...digits];
    updated[index] = value.slice(-1); // take last char (in case of paste-by-key)
    setDigits(updated);
    setError("");
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const updated = [...digits];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setDigits(updated);
    const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    const email = sessionStorage.getItem("reset_email");
    if (!email) {
      setError("Session expired. Please request a new code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email,
        otp: code,
      });

      const { resetToken } = response.data;
      sessionStorage.setItem("reset_token", resetToken);
      router.push("/new-password");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;
    const email = sessionStorage.getItem("reset_email");
    if (!email) {
      setError("Session expired. Please request a new code.");
      return;
    }

    setResendDisabled(true);
    setResendCountdown(30);
    setDigits(Array(CODE_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();

    try {
      await axios.post("/api/auth/forgot-password", { email });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to resend code. Please try again.");
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  const isFilled = digits.every((d) => d !== "");

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
        <Link href="/" className="group focus:outline-none">
          <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
            <img
              src="/logo_transparent.png"
              alt="Flixo Logo"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02] select-none"
            />
          </div>
        </Link>
        <button
          title="Help Center"
          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur flex items-center justify-center text-auth-muted hover:text-white transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* ── Main Card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[440px] bg-auth-card/65 border border-white/5 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col items-center gap-6 text-center anim-fade-up anim-delay-100">

          {/* Mail Icon with Settings Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#2a1f22] border border-white/5 flex items-center justify-center shadow-lg">
              {/* Envelope SVG */}
              <svg className="w-9 h-9 text-auth-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            {/* Settings badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-auth-secondary to-auth-tertiary flex items-center justify-center shadow-md">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.986.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Verify Your Email</h1>
            <p className="text-auth-muted text-sm leading-relaxed max-w-xs mx-auto">
              We&apos;ve sent a verification code to your email address. Please enter the 6-digit code below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* OTP Digit Inputs */}
          <div className="flex items-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className={`
                  w-11 h-12 sm:w-12 sm:h-13 rounded-xl text-center text-lg font-extrabold
                  bg-[#1c1617] border transition-all outline-none select-none
                  text-white placeholder-auth-muted/30 caret-auth-primary
                  focus:border-auth-primary/60 focus:ring-2 focus:ring-auth-primary/25
                  ${digit ? "border-auth-primary/40" : "border-white/8"}
                  disabled:opacity-50
                `}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !isFilled}
            className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          {/* Resend & Change Email */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-sm font-bold text-auth-text hover:text-white transition-colors disabled:text-auth-muted/50 disabled:cursor-not-allowed cursor-pointer"
            >
              {resendDisabled
                ? `Resend Code (${resendCountdown}s)`
                : "Resend Code"}
            </button>
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-auth-muted hover:text-white transition-colors"
            >
              Change Email
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-6 px-6 sm:px-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-auth-muted select-none anim-fade-in anim-delay-300">
        <span>© {new Date().getFullYear()} Flixo Streaming. All rights reserved.</span>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Help Center</a>
      </footer>
    </div>
  );
}
