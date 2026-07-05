import React from "react";
import { Film, MonitorPlay, Sparkles, Search, Bookmark, LucideIcon } from "lucide-react";

type Variant = "movie" | "series" | "anime" | "search" | "favourite" | "default";

const VARIANT_ICON: Record<Variant, LucideIcon> = {
  movie: Film,
  series: MonitorPlay,
  anime: Sparkles,
  search: Search,
  favourite: Bookmark,
  default: Film,
};

interface NoDataProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: Variant;
}

const NoData: React.FC<NoDataProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}) => {
  const Icon = VARIANT_ICON[variant];

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[440px] px-6 py-16 text-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-fuchsia-600/10 blur-[120px]" />

      {/* Icon with animated rings */}
      <div className="relative mb-8 flex items-center justify-center">
        <span className="absolute inline-flex h-24 w-24 rounded-full bg-fuchsia-500/20 blur-md" />
        <span className="absolute inline-flex h-24 w-24 rounded-full ring-1 ring-fuchsia-500/20 animate-ping opacity-60" />
        <span className="absolute inline-flex h-32 w-32 rounded-full ring-1 ring-white/5" />

        <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10 ring-1 ring-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10">
          <Icon className="h-11 w-11 text-fuchsia-400" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <h3 className="relative text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2.5">
        {title}
      </h3>
      <p className="relative max-w-md text-neutral-400 text-sm md:text-base leading-relaxed mb-8">
        {description}
      </p>

      {/* Action button */}
      {actionLabel && (
        <button
          onClick={onAction}
          className="relative px-7 py-2.5 font-semibold text-white rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-[1.03] active:scale-95 transition-all duration-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default NoData;
