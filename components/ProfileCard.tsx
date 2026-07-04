"use client";

import { useSelectionStore } from "@/zustand/useSelectStore";
import Image from "next/image";
import { useRouter } from "next/router";
import { Trash2 } from "lucide-react";

type ProfileProps = {
  profile: {
    id: string;
    name: string;
    avatar?: string;
    image?: string;
    isUser?: boolean;
    isKids?: boolean;
  };
  isManaging?: boolean;
  onDelete?: (id: string) => void;
};

export default function ProfileCard({
  profile,
  isManaging = false,
  onDelete,
}: ProfileProps) {
  const setUser = useSelectionStore((state) => state.setUser);
  const setProfile = useSelectionStore((state) => state.setProfile);
  const router = useRouter();

  const handleSelect = () => {
    if (isManaging) return;

    if (profile.isUser) {
      setUser({
        id: profile.id,
        name: profile.name,
        image: profile.image,
      });
    } else {
      setProfile({
        id: profile.id,
        name: profile.name,
        image: profile.avatar,
      });
    }

    router.push("/");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(profile.id);
  };

  const avatarSrc =
    profile.avatar ||
    profile.image ||
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=1a0a10`;

  return (
    <div
      onClick={handleSelect}
      className="group cursor-pointer flex flex-col items-center"
    >
      {/* Avatar Box */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-auth-primary/70 group-hover:shadow-lg group-hover:shadow-auth-primary/20 transition-all duration-200">
        <Image
          src={avatarSrc}
          alt={profile.name}
          fill
          className="object-cover"
          unoptimized={avatarSrc.startsWith("https://api.dicebear")}
        />

        {/* Kids badge */}
        {profile.isKids && (
          <div className="absolute bottom-1.5 right-1.5 bg-auth-primary text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
            Kids
          </div>
        )}

        {/* Delete button (manage mode) */}
        {isManaging && !profile.isUser && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <Trash2 size={13} className="text-white" />
          </button>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
      </div>

      {/* Name */}
      <p className="mt-4 text-white/50 group-hover:text-white text-sm font-semibold transition-colors duration-200 text-center">
        {profile.name}
      </p>
    </div>
  );
}