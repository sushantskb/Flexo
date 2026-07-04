import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, HelpCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Simulate API call for reset link
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess("We have sent a secure password reset link to your email.");
      setEmail("");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-auth-primary selection:text-white">
      {/* Background Poster Collage with Blur + Solid Black Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02]" 
          style={{ backgroundImage: "url('/images/landing/landing_page_hero.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/80 via-neutral-dark/85 to-auth-bg/95 backdrop-blur-[6px]" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Top Header Bar — subtle fade in */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between anim-fade-in">
        {/* Left Side Logo */}
        <Link href="/" className="group focus:outline-none">
          <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
            <img 
              src="/logo_transparent.png" 
              alt="Flixo Logo" 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02] select-none"
            />
          </div>
        </Link>

        {/* Right Side Help Link */}
        <button 
          onClick={() => alert("Help Center is available at support@flixo.com. For instant support, please contact us via the help desk.")}
          aria-label="Get Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area — Box Centered horizontally & vertically */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[460px] bg-auth-card/65 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl flex flex-col gap-6 text-center anim-fade-up anim-delay-100">
          
          {/* Header Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-auth-primary to-auth-secondary flex items-center justify-center shadow-lg shadow-auth-primary/20">
            <svg className="w-8 h-8 text-white animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              <rect x="9.5" y="11.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M10.5 11.5V10a1.5 1.5 0 013 0v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Heading Description */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forgot Your Password?
            </h2>
            <p className="text-auth-muted text-sm sm:text-base leading-relaxed px-2">
              Enter your registered email address and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold">
              {success}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            <div>
              <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <div className="relative flex items-center bg-[#1c1617] border border-white/5 focus-within:border-auth-primary/30 focus-within:ring-2 focus-within:ring-auth-primary/20 rounded-xl px-4 py-3.5 transition-all">
                <Mail className="w-5 h-5 text-auth-muted flex-shrink-0" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  disabled={loading}
                  className="bg-transparent border-0 outline-none text-auth-text font-bold text-sm w-full ml-3 placeholder:text-auth-muted/40 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-auth-primary/50 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back link */}
          <Link 
            href="/auth"
            className="flex items-center justify-center gap-2 text-xs font-bold text-auth-muted hover:text-auth-text transition-colors mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

        </div>
      </main>

      {/* Spacer to align main centered */}
      <div className="h-16" />
    </div>
  );
}
