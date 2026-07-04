"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import { useSelectionStore } from "@/zustand/useSelectStore";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { HiOutlineUsers, HiOutlineLogout } from "react-icons/hi";

interface AccountMenuProps {
  visible?: boolean;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ visible }) => {
  const router = useRouter();
  const { user, profile, clear } = useSelectionStore();

  if (!visible) return null;

  const active = profile || user;
  return (
    <div className="absolute right-0 top-14 w-64 bg-neutral-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
      <div className="flex flex-col p-2">
        {/* Active Profile */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <img
            src={active?.image || "/images/default-avatar.png"}
            alt={active?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-500/40"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white leading-tight">
              {active?.name || "Profile"}
            </span>
            <span className="text-xs text-neutral-500">
              {profile ? "Profile" : "Account"}
            </span>
          </div>
        </div>

        {/* Switch Profiles */}
        <button
          onClick={() => router.push("/profiles")}
          className="flex items-center gap-3 text-left px-3 py-2.5 mt-2 rounded-xl text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition">
          <HiOutlineUsers className="text-lg text-neutral-400" />
          Switch Profiles
        </button>

        <div className="border-t border-white/10 my-2" />

        {/* Sign Out */}
        <button
          onClick={() => {
            signOut();
            clear();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition text-left">
          <HiOutlineLogout className="text-lg" />
          Sign out of Flixo
        </button>
      </div>
    </div>
  );
};

export default AccountMenu;
