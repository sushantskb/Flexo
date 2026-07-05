"use client";

import React from "react";
import { useRouter } from "next/router";
import { BsFillPlayFill, BsXCircleFill } from "react-icons/bs";
import { MdHistory } from "react-icons/md";
import axios from "axios";
import { useInView } from "@/hooks/useInView";

interface WatchProgressItem {
  id: string;
  contentType: "movie" | "episode";
  movieId?: string;
  seriesId?: string;
  episodeId?: string;
  title?: string;
  thumbnailUrl?: string;
  episodeLabel?: string;
  currentTime: number;
  duration: number;
  percentage: number;
}

interface ContinueWatchingRowProps {
  data: WatchProgressItem[];
  onRemove: () => void;
}

const formatRemaining = (seconds: number) => {
  const totalMin = Math.floor(seconds / 60);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m remaining` : `${h}h remaining`;
  }
  if (totalMin <= 0) return "Almost done";
  return `${totalMin}m remaining`;
};

const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ data, onRemove }) => {
  const router = useRouter();
  const [ref, isInView, hasVisited] = useInView({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  if (!data || data.length === 0) return null;

  const handlePlay = (item: WatchProgressItem) => {
    if (item.contentType === "movie" && item.movieId) {
      router.push(`/watch/${item.movieId}`);
    } else if (item.contentType === "episode" && item.seriesId) {
      router.push(`/series/${item.seriesId}`);
    }
  };

  const handleRemove = async (e: React.MouseEvent, item: WatchProgressItem) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/watch-progress?id=${item.id}`);
      onRemove();
    } catch {}
  };

  const timeRemaining = (item: WatchProgressItem) => {
    const remaining = item.duration - item.currentTime;
    if (remaining <= 0 || !item.duration) return null;
    return formatRemaining(remaining);
  };

  return (
    <div
      ref={ref}
      className={`px-6 md:px-16 mt-10 ${hasVisited ? "row-shown" : isInView ? "row-enter-active" : "row-enter"}`}
    >
      {/* Section Header */}
      <h2 className="section-title text-white text-2xl md:text-3xl font-bold mb-5">
        Continue Watching
      </h2>

      {/* Horizontal Scroll Row */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide smooth-scroll pb-2">
        {data.map((item) => {
          const remaining = timeRemaining(item);
          const meta = [item.episodeLabel, remaining].filter(Boolean).join(" • ");
          return (
            <div
              key={item.id}
              onClick={() => handlePlay(item)}
              className="group flex-shrink-0 w-[260px] sm:w-[300px] md:w-[340px] cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="card-row relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 ring-1 ring-white/10 hover:ring-fuchsia-500/50">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <BsFillPlayFill size={44} className="text-neutral-600" />
                  </div>
                )}

                {/* Play overlay on hover */}
                <div className="card-overlay">
                  <div className="w-14 h-14 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/40">
                    <BsFillPlayFill size={26} className="text-white ml-0.5" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white/90 hover:text-red-400"
                  title="Remove from Continue Watching"
                >
                  <BsXCircleFill size={22} />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-[5px] bg-black/40 z-10">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow-[0_0_10px_rgba(217,70,239,0.7)] transition-all"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mt-3 px-1">
                <p className="text-white text-lg font-bold line-clamp-1">{item.title}</p>
                {meta && (
                  <p className="text-neutral-500 text-sm mt-1 line-clamp-1">{meta}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Trailing ghost / history card */}
        <div className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[340px]">
          <div className="w-full aspect-video rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] transition">
            <MdHistory size={40} className="text-neutral-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
