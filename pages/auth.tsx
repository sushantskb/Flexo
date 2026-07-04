import axios from "axios";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import Link from "next/link";
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

const Auth = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [variant, setVariant] = useState("login");
  
  const toggleVariant = useCallback(() => {
    setError("");
    setVariant((currentVariant) =>
      currentVariant === "login" ? "register" : "login"
    );
  }, []);

  const login = useCallback(async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/profiles",
      });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/profiles");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const register = useCallback(async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/register", {
        email,
        username,
        password,
      });
      // Automatically log in after registration
      await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/profiles",
      });
      router.push("/profiles");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Email already exists or is invalid.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [email, username, password, confirmPassword, agree, router]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden selection:bg-auth-primary selection:text-white py-16 px-4 sm:px-6 md:px-8">
      {/* Background Poster Collage with Blur + Dark Wash Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02]" 
          style={{ backgroundImage: "url('/images/landing/landing_page_hero.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/80 via-neutral-dark/85 to-auth-bg/95 backdrop-blur-[6px]" />
        {/* Solid black overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Centered Logo Header */}
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        <Link href="/" className="group focus:outline-none mb-4" id="auth-logo-link">
          <div className="relative h-12 w-36 overflow-hidden flex items-center justify-center">
            <img 
              src="/logo_transparent.png" 
              alt="Flixo Logo" 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 max-w-none object-contain transition-transform duration-200 group-hover:scale-[1.05] select-none"
            />
          </div>
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {variant === "login" ? "Sign In to Flixo" : "Create Your Flixo Account"}
        </h1>
        <p className="text-auth-muted text-sm font-semibold mt-2 tracking-wide">
          Unlimited entertainment starts here.
        </p>
      </div>

      {/* Auth Panel Card */}
      <div className="relative z-10 w-full max-w-[500px] bg-auth-card/65 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col gap-6">
        
        {/* Error message block */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="flex flex-col gap-5">
          {variant === "register" && (
            <div>
              <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
                Full Name
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Jane Doe" 
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-bold px-5 py-3.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-auth-primary/50 text-sm shadow-inner transition-all placeholder:text-zinc-400"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com" 
              disabled={loading}
              className="w-full bg-white text-zinc-950 font-bold px-5 py-3.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-auth-primary/50 text-sm shadow-inner transition-all placeholder:text-zinc-400"
            />
          </div>

          {variant === "register" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  disabled={loading}
                  className="w-full bg-white text-zinc-950 font-bold px-5 py-3.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-auth-primary/50 text-sm shadow-inner transition-all placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  disabled={loading}
                  className="w-full bg-white text-zinc-950 font-bold px-5 py-3.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-auth-primary/50 text-sm shadow-inner transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-auth-muted uppercase tracking-widest mb-2 block">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-bold px-5 py-3.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-auth-primary/50 text-sm shadow-inner transition-all placeholder:text-zinc-400"
              />
            </div>
          )}

          {/* Terms checkbox for register */}
          {variant === "register" && (
            <label className="flex items-start gap-3 text-xs font-bold text-auth-muted cursor-pointer select-none mt-1">
              <input 
                type="checkbox" 
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                disabled={loading}
                className="w-4.5 h-4.5 rounded border-white/10 text-auth-primary bg-zinc-900/60 focus:ring-0 focus:ring-offset-0 mt-0.5 cursor-pointer accent-auth-primary" 
              />
              <span className="leading-tight">
                I agree to the <span className="text-auth-primary hover:underline">Terms of Service</span> & <span className="text-auth-primary hover:underline">Privacy Policy</span>.
              </span>
            </label>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={variant === "login" ? login : register}
          disabled={loading}
          className="w-full bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-auth-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-auth-primary/50 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {loading ? "Please wait..." : variant === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative px-4 bg-[#1D1516] text-[10px] font-bold tracking-widest text-auth-muted uppercase select-none">
            Or Continue With
          </span>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/profiles" })}
            disabled={loading}
            className="w-full bg-[#181415] hover:bg-[#201B1C] border border-white/5 text-white font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

      </div>

      {/* Switch Toggle */}
      <p className="relative z-10 text-auth-muted text-sm text-center font-semibold mt-6 select-none">
        {variant === "login" ? "First time using Flixo?" : "Already have an account?"}{" "}
        <span
          onClick={toggleVariant}
          className="text-auth-primary hover:underline hover:text-auth-primary/90 cursor-pointer font-bold ml-1 transition-colors"
        >
          {variant === "login" ? "Create an account" : "Sign In"}
        </span>
      </p>
    </div>
  );
};

export default Auth;
