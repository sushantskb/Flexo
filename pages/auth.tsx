import axios from "axios";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { authOptions } from "./api/auth/[...nextauth]";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

/* ─────────────────────────────────────────────────────
   Reusable Input Row helper
───────────────────────────────────────────────────── */
const WhiteInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  rightEl,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  rightEl?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-auth-muted uppercase tracking-widest block">
      {label}
    </label>
    <div className="relative flex items-center bg-white border border-white/20 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-auth-primary/40 transition-all">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent border-0 outline-none text-neutral-900 font-semibold text-sm placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
      />
      {rightEl}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
   Shared Social OAuth Buttons
───────────────────────────────────────────────────── */
const SocialButtons = ({ loading }: { loading: boolean }) => (
  <div className="flex flex-col gap-3">
    <button
      onClick={() => signIn("google", { callbackUrl: "/profiles" })}
      disabled={loading}
      className="w-full bg-[#181415] hover:bg-[#201B1C] border border-white/10 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>

    <button
      onClick={() => alert("Apple Sign-In is configured in production.")}
      disabled={loading}
      className="w-full bg-[#181415] hover:bg-[#201B1C] border border-white/10 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
    >
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z" />
      </svg>
      Continue with Apple
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────
   Shared full-page background
───────────────────────────────────────────────────── */
const PageBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/landing/landing_page_hero.png')" }}
    />
    <div className="absolute inset-0 bg-black/70" />
  </div>
);

/* ─────────────────────────────────────────────────────
   Shared OR separator
───────────────────────────────────────────────────── */
const OrSeparator = ({ label = "Or" }: { label?: string }) => (
  <div className="relative flex items-center justify-center py-1">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-white/10" />
    </div>
    <span className="relative px-4 bg-transparent text-[10px] font-bold tracking-widest text-auth-muted uppercase select-none">
      {label}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════
   Main Auth Component
═══════════════════════════════════════════════════ */
const Auth = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState("login");

  const toggleVariant = useCallback(() => {
    setError("");
    setVariant((v) => (v === "login" ? "register" : "login"));
  }, []);

  const login = useCallback(async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/profiles" });
      if (res?.error) setError("Invalid email or password.");
      else router.push("/profiles");
    } catch { setError("An unexpected error occurred. Please try again."); }
    finally { setLoading(false); }
  }, [email, password, router]);

  const register = useCallback(async () => {
    if (!username || !email || !password || !confirmPassword) { setError("Please fill in all fields."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agree) { setError("You must agree to the Terms of Service & Privacy Policy."); return; }
    setLoading(true); setError("");
    try {
      await axios.post("/api/register", { email, username, password });
      await signIn("credentials", { email, password, redirect: false, callbackUrl: "/profiles" });
      router.push("/profiles");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Email already exists or is invalid.");
    } finally { setLoading(false); }
  }, [email, username, password, confirmPassword, agree, router]);

  /* ── REGISTER LAYOUT: full-width centered ── */
  if (variant === "register") {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden selection:bg-auth-primary selection:text-white">
        <PageBackground />

        {/* Scrollable content wrapper */}
        <div className="relative z-10 w-full flex flex-col items-center py-10 px-4">

          {/* Logo */}
          <Link href="/" className="group focus:outline-none mb-8 anim-fade-in">
            <div className="relative h-12 w-36 overflow-hidden flex items-center justify-center">
              <img
                src="/logo_transparent.png"
                alt="Flixo Logo"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 max-w-none object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
          </Link>

          {/* Page Title */}
          <div className="text-center mb-8 space-y-2 anim-fade-up anim-delay-100">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Create Your Flixo Account
            </h1>
            <p className="text-auth-muted text-sm font-semibold tracking-wide">
              Unlimited entertainment starts here.
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-[620px] bg-auth-card/70 border border-white/5 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col gap-5 anim-fade-up anim-delay-200">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* Username */}
            <WhiteInput
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="janedoe"
              disabled={loading}
            />

            {/* Email */}
            <WhiteInput
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="jane@example.com"
              disabled={loading}
            />

            {/* Password + Confirm Password — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WhiteInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                disabled={loading}
                rightEl={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer ml-2">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <WhiteInput
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                disabled={loading}
                rightEl={
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer ml-2">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 text-xs font-bold text-auth-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-white/10 mt-0.5 cursor-pointer accent-auth-primary"
              />
              <span className="leading-snug">
                I agree to the{" "}
                <span className="text-auth-primary hover:underline">Terms of Service</span>{" "}
                &{" "}
                <span className="text-auth-primary hover:underline">Privacy Policy</span>.
              </span>
            </label>

            {/* Create Account Button */}
            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* OR separator */}
            <OrSeparator label="Or Continue With" />

            {/* Social */}
            <SocialButtons loading={loading} />

            {/* Switch to Login */}
            <p className="text-auth-muted text-sm text-center font-semibold select-none">
              Already have an account?{" "}
              <span onClick={toggleVariant} className="text-white hover:text-white/80 cursor-pointer font-bold ml-1 transition-colors">
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOGIN LAYOUT: split-screen ── */
  return (
    <div className="relative min-h-screen w-full flex overflow-x-hidden selection:bg-auth-primary selection:text-white">

      {/* Full-page background */}
      <PageBackground />

      {/* Left Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Logo Top-Left */}
        <div className="absolute top-10 left-12 z-10 flex items-center anim-fade-in">
          <Link href="/" className="group focus:outline-none">
            <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
              <img
                src="/logo_transparent.png"
                alt="Flixo Logo"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.02] select-none"
              />
            </div>
          </Link>
        </div>

        {/* Bottom copy */}
        <div className="absolute bottom-40 left-16 right-16 z-10 space-y-4 anim-fade-up anim-delay-200">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-lg">
            Experience Stories Unbound
          </h2>
          <p className="text-auth-muted text-sm sm:text-base leading-relaxed max-w-md">
            Stream the latest blockbusters and exclusive originals in stunning 4K HDR. Your portal to cinematic excellence begins here.
          </p>
          <div className="text-[10px] font-bold tracking-widest text-auth-muted uppercase pt-2 select-none">
            Streamverse
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between items-center py-12 px-6 sm:px-12 z-10 relative">

        {/* Mobile-only logo */}
        <div className="relative z-10 mb-6 flex flex-col items-center text-center lg:hidden anim-fade-in">
          <Link href="/" className="group focus:outline-none mb-4">
            <div className="relative h-12 w-36 overflow-hidden flex items-center justify-center">
              <img
                src="/logo_transparent.png"
                alt="Flixo Logo"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 max-w-none object-contain select-none"
              />
            </div>
          </Link>
        </div>

        <div className="hidden lg:block h-8" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[420px] bg-auth-card/65 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col gap-6 anim-fade-up anim-delay-100">

          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Welcome Back</h1>
            <p className="text-auth-muted text-sm font-semibold tracking-wide">Continue your entertainment journey.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-1.5 block">Email Address</label>
              <div className="relative flex items-center bg-[#1c1617] border border-white/5 focus-within:border-auth-primary/30 focus-within:ring-2 focus-within:ring-auth-primary/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-auth-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" disabled={loading}
                  className="bg-transparent border-0 outline-none text-auth-text font-bold text-sm w-full ml-3 placeholder:text-auth-muted/40 focus:ring-0 focus:outline-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative flex items-center bg-[#1c1617] border border-white/5 focus-within:border-auth-primary/30 focus-within:ring-2 focus-within:ring-auth-primary/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-auth-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading}
                  className="bg-transparent border-0 outline-none text-auth-text font-bold text-sm w-full ml-3 placeholder:text-auth-muted/40 focus:ring-0 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-auth-muted hover:text-white transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot */}
            <div className="flex items-center justify-between text-xs font-bold text-auth-muted mt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading}
                  className="w-4 h-4 rounded border-white/10 bg-zinc-900/60 cursor-pointer accent-auth-primary" />
                <span>Remember Me</span>
              </label>
              <Link href="/forgot-password" className="text-auth-primary hover:underline transition-colors uppercase tracking-wider text-[10px]">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Sign In Button */}
          <button onClick={login} disabled={loading}
            className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none">
            {loading ? "Please wait..." : "Sign In"}
          </button>

          <OrSeparator />

          <SocialButtons loading={loading} />

          {/* Switch to Register */}
          <p className="text-auth-muted text-sm text-center font-semibold select-none anim-fade-in anim-delay-300">
            Don&apos;t have an account?{" "}
            <span onClick={toggleVariant} className="text-white hover:text-white/80 cursor-pointer font-bold ml-1 transition-colors">
              Create Account
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full text-center space-y-3 mt-12 anim-fade-in anim-delay-300 select-none">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-auth-muted">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-[10px] font-bold text-auth-muted/70">
            © {new Date().getFullYear()} Flixo Streaming. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
