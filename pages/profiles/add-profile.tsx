import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import useCurrentUser from "@/hooks/useCurrentUser";
import { HelpCircle, ArrowLeft, Check } from "lucide-react";

/* ─── 12 preset avatars across different styles ─── */
const AVATARS = [
  // Adventurer style
  { id: "cyber",    src: "https://api.dicebear.com/9.x/adventurer/svg?seed=Cyber&backgroundColor=0f0a0d",    label: "Cyber" },
  { id: "ember",    src: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ember&backgroundColor=0f0a0d",    label: "Ember" },
  { id: "nova",     src: "https://api.dicebear.com/9.x/adventurer/svg?seed=Nova&backgroundColor=0f0a0d",     label: "Nova" },
  { id: "rift",     src: "https://api.dicebear.com/9.x/adventurer/svg?seed=Rift&backgroundColor=0f0a0d",     label: "Rift" },
  // Pixel art style
  { id: "blaze",    src: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Blaze&backgroundColor=0f0a0d",    label: "Blaze" },
  { id: "frost",    src: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Frost&backgroundColor=0f0a0d",    label: "Frost" },
  { id: "storm",    src: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Storm&backgroundColor=0f0a0d",    label: "Storm" },
  { id: "vex",      src: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Vex&backgroundColor=0f0a0d",      label: "Vex" },
  // Lorelei style
  { id: "luna",     src: "https://api.dicebear.com/9.x/lorelei/svg?seed=Luna&backgroundColor=0f0a0d",      label: "Luna" },
  { id: "echo",     src: "https://api.dicebear.com/9.x/lorelei/svg?seed=Echo&backgroundColor=0f0a0d",      label: "Echo" },
  // Fun / Notionists
  { id: "spike",    src: "https://api.dicebear.com/9.x/notionists/svg?seed=Spike&backgroundColor=0f0a0d",   label: "Spike" },
  { id: "arc",      src: "https://api.dicebear.com/9.x/notionists/svg?seed=Arc&backgroundColor=0f0a0d",     label: "Arc" },
];

const THEMES = [
  {
    id: "Default",
    label: "Default",
    bg: "linear-gradient(135deg, #1a0a10 0%, #0d0608 60%, #12060e 100%)",
    preview: { card: "bg-[#1a0a10]/80", border: "border-white/5", text: "text-white", sub: "text-white/40" },
  },
  {
    id: "Dark",
    label: "Dark",
    bg: "linear-gradient(135deg, #0a0a0a 0%, #050505 60%, #0f0f0f 100%)",
    preview: { card: "bg-neutral-950/80", border: "border-white/5", text: "text-white", sub: "text-white/30" },
  },
  {
    id: "Colorful",
    label: "Colorful",
    bg: "linear-gradient(135deg, #1a0535 0%, #0d0620 50%, #1f0a30 100%)",
    preview: { card: "bg-purple-950/50", border: "border-purple-500/20", text: "text-white", sub: "text-purple-300/60" },
  },
] as const;

type ThemeId = typeof THEMES[number]["id"];

/* ─── Animated toggle switch ─── */
const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${on ? "bg-gradient-to-r from-auth-primary to-auth-secondary" : "bg-white/10"}`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

export default function AddProfilePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [isKids, setIsKids] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [recommendations, setRecommendations] = useState(true);
  const [themeId, setThemeId] = useState<ThemeId>("Default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentAvatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const displayName = name.trim() || "New Member";

  const handleCreate = async () => {
    if (!name.trim()) { setError("Please enter a profile name."); return; }
    if (!user?.email) { setError("User session expired. Please log in again."); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post(`/api/profiles/add-profile?email=${user.email}`, {
        name: name.trim(),
        isKids,
        avatar: currentAvatar.src,
      });
      router.push("/profiles");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col overflow-x-hidden transition-all duration-500"
      style={{ background: currentTheme.bg }}
    >
      {/* ── Header ── */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        <Link href="/" className="group focus:outline-none">
          <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
            <img
              src="/logo_transparent.png"
              alt="Flixo Logo"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain select-none group-hover:scale-[1.02] transition-transform"
            />
          </div>
        </Link>
        <button
          title="Help Center"
          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* ── Body: Two-column Layout ── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 px-6 sm:px-12 py-8 max-w-5xl mx-auto w-full">

        {/* LEFT: Form */}
        <div className="flex flex-col gap-7">

          {/* Page title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Create Your Profile</h1>
            <p className="text-white/40 text-sm mt-1.5 font-semibold">Personalize your Flixo experience with a custom identity.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* ── Avatar Picker ── */}
          <div>
            <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Choose Your Avatar</h2>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2.5">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    title={avatar.label}
                    className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer focus:outline-none group ${
                      isSelected
                        ? "border-auth-primary shadow-lg shadow-auth-primary/30 scale-[1.06]"
                        : "border-white/8 hover:border-white/30 hover:scale-[1.04]"
                    }`}
                  >
                    <div className="w-full h-full bg-[#1a0a10] flex items-center justify-center">
                      <img
                        src={avatar.src}
                        alt={avatar.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-auth-primary/15 flex items-end justify-end p-1">
                        <div className="w-4 h-4 rounded-full bg-auth-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-white/30 mt-2 font-semibold">
              {AVATARS.length} avatars available across 4 styles
            </p>
          </div>

          {/* ── Profile Name ── */}
          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">
              Profile Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. MovieBuff24"
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 focus:border-auth-primary/50 focus:ring-2 focus:ring-auth-primary/20 rounded-xl px-4 py-3.5 text-white font-semibold text-sm placeholder:text-white/20 outline-none transition-all"
            />
          </div>

          {/* ── Preferences ── */}
          <div>
            <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-white">Kids Profile</p>
                  <p className="text-[11px] text-white/40 font-semibold">Family-friendly content only</p>
                </div>
                <Toggle on={isKids} onToggle={() => setIsKids(!isKids)} />
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-white">Autoplay Next</p>
                  <p className="text-[11px] text-white/40 font-semibold">Binge-watching enabled</p>
                </div>
                <Toggle on={autoplay} onToggle={() => setAutoplay(!autoplay)} />
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-white">Recommendations</p>
                  <p className="text-[11px] text-white/40 font-semibold">Personalized curation</p>
                </div>
                <Toggle on={recommendations} onToggle={() => setRecommendations(!recommendations)} />
              </div>
            </div>
          </div>

          {/* ── Interface Theme ── */}
          <div>
            <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Interface Theme</h2>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer border overflow-hidden ${
                    themeId === t.id
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {/* Swatch for colorful */}
                  {t.id === "Colorful" && themeId !== t.id && (
                    <span className="absolute inset-0 opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-2 font-semibold">
              Theme affects the background and preview. Applies immediately.
            </p>
          </div>

          {/* ── Create Button ── */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-auth-primary to-auth-secondary text-white font-extrabold text-sm rounded-full shadow-lg shadow-auth-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Creating..." : "Create Profile →"}
            </button>
            <button
              onClick={() => router.push("/profiles")}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3.5 border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm font-bold rounded-full transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview Card */}
        <div className="hidden lg:flex flex-col">
          <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6 text-center">Live Preview</h2>
          <div
            className={`sticky top-8 ${currentTheme.preview.card} border ${currentTheme.preview.border} backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center gap-5 shadow-2xl transition-all duration-500`}
          >
            {/* Avatar Preview */}
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-auth-primary/40 shadow-lg shadow-auth-primary/20">
              <img
                src={currentAvatar.src}
                alt="Avatar Preview"
                className="w-full h-full object-cover bg-[#1a0a10]"
              />
            </div>

            {/* Name */}
            <p className={`text-xl font-extrabold ${currentTheme.preview.text} tracking-tight text-center`}>
              {displayName}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className={`px-3 py-1 bg-white/8 border border-white/10 rounded-full text-[11px] font-bold ${currentTheme.preview.sub}`}>
                {themeId} Theme
              </span>
              <span className={`px-3 py-1 bg-white/8 border border-white/10 rounded-full text-[11px] font-bold ${currentTheme.preview.sub}`}>
                Standard
              </span>
              {isKids && (
                <span className="px-3 py-1 bg-auth-primary/20 border border-auth-primary/30 rounded-full text-[11px] font-bold text-auth-primary">
                  Kids
                </span>
              )}
            </div>

            {/* Mock content blocks */}
            <div className="w-full space-y-3 mt-1">
              <div className="h-1.5 w-24 bg-white/10 rounded-full mx-auto" />
              <div className="grid grid-cols-3 gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-14 rounded-lg ${themeId === "Colorful" ? "bg-purple-500/10" : "bg-white/5"} border ${themeId === "Colorful" ? "border-purple-500/10" : "border-white/5"}`} />
                ))}
              </div>
            </div>

            {/* Theme indicator badge */}
            <div
              className="w-full h-1 rounded-full mt-1 opacity-60"
              style={{
                background: themeId === "Default"
                  ? "linear-gradient(to right, #FF4D8D, #C13DFF)"
                  : themeId === "Dark"
                  ? "linear-gradient(to right, #555, #999)"
                  : "linear-gradient(to right, #a855f7, #ec4899)",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
