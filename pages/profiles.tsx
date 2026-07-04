import ProfileCard from "@/components/ProfileCard";
import useCurrentUser from "@/hooks/useCurrentUser";
import useGetProfiles from "@/hooks/useGetProfiles";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HelpCircle, Plus, Settings } from "lucide-react";

export default function ProfilePage() {
  const { data: profiles, mutate } = useGetProfiles();
  const { data: currentUser } = useCurrentUser();
  const router = useRouter();

  const [isManaging, setIsManaging] = useState(false);

  const handleDelete = async (profileId: string) => {
    try {
      await axios.delete(`/api/profiles?profileId=${profileId}`);
      mutate();
    } catch (error) {
      console.error("Failed to delete profile");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1a0a10 0%, #0d0608 50%, #12060e 100%)" }}
    >
      {/* ── Header ── */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        <Link href="/" className="group focus:outline-none">
          <div className="relative h-12 w-32 overflow-hidden flex items-center justify-start">
            <img
              src="/logo_transparent.png"
              alt="Flixo Logo"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 max-w-none object-contain select-none group-hover:scale-[1.02] transition-transform duration-200"
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

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-12 text-center">
          Who&apos;s Watching?
        </h1>

        {/* Profile Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-12">
          {/* Current User Card */}
          {currentUser && (
            <ProfileCard
              profile={{
                id: currentUser.id,
                name: currentUser.name,
                image: currentUser.image,
                isUser: true,
              }}
              isManaging={isManaging}
              onDelete={handleDelete}
            />
          )}

          {/* Additional Profiles */}
          {profiles?.map((profile: any) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isManaging={isManaging}
              onDelete={handleDelete}
            />
          ))}

          {/* Add Profile Slot */}
          {!isManaging && (
            <div
              onClick={() => router.push("/profiles/add-profile")}
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-white/5 border-2 border-white/10 group-hover:border-auth-primary/60 group-hover:bg-white/10 flex items-center justify-center transition-all duration-200">
                <span className="text-white/30 group-hover:text-auth-primary text-4xl font-thin transition-colors duration-200">+</span>
              </div>
              <p className="mt-4 text-white/40 group-hover:text-white text-sm font-semibold transition-colors duration-200">
                Add Profile
              </p>
            </div>
          )}

          {/* Guest Slot */}
          {!isManaging && (
            <div
              onClick={() => router.push("/")}
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl bg-white/5 border-2 border-white/10 group-hover:border-white/30 group-hover:bg-white/8 flex items-center justify-center transition-all duration-200">
                <svg className="w-10 h-10 text-white/30 group-hover:text-white/60 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="mt-4 text-white/40 group-hover:text-white text-sm font-semibold transition-colors duration-200">
                Guest
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsManaging((prev) => !prev)}
            className="flex items-center gap-2 px-6 py-2.5 border border-white/20 rounded-full text-white/60 hover:text-white hover:border-white/50 text-sm font-bold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            {isManaging ? "Done" : "Manage Profiles"}
          </button>

          {!isManaging && (
            <button
              onClick={() => router.push("/profiles/add-profile")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-auth-primary to-auth-secondary rounded-full text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-auth-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
