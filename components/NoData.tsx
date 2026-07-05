import React from "react";
import { Film } from "lucide-react"; // Optional: Use an icon library like Lucide

const NoData = ({
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] p-8 text-center bg-transparent">
      {/* Icon Container */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-fuchsia-500/15 to-pink-500/10 ring-1 ring-fuchsia-500/20">
        <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-xl" />
        <Film className="relative w-10 h-10 text-fuchsia-400" />
      </div>

      {/* Text Content */}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="max-w-xs text-neutral-400 text-base mb-8">{description}</p>

      {/* Optional Action Button (like "Go Home" or "Clear Search") */}
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-7 py-2.5 font-semibold text-white rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30 hover:opacity-90 transition">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default NoData;
