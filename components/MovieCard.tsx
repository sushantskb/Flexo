import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import FavouriteBtn from "./FavouriteBtn";
import { useRouter } from "next/router";
import useModelInfo from "@/hooks/useModelInfo";
import { BiChevronDown } from "react-icons/bi";
import { useSelectionStore } from "@/zustand/useSelectStore";

interface MovieCardProps {
  data: Record<string, any>;
}

const isNewlyAdded = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= 7;
};

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const router = useRouter();
  const { openModel } = useModelInfo();
  const { profile } = useSelectionStore();

  return (
    <div className="card-row group relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-fuchsia-500/50 cursor-pointer">
      {/* NEW badge */}
      {isNewlyAdded(data.createdAt) && (
        <span className="absolute top-3 right-3 z-20 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-lg shadow-fuchsia-500/30">
          New
        </span>
      )}

      {/* Poster */}
      <img
        className="w-full h-full object-cover"
        src={data.thumbnailUrl}
        alt={data.title || "Thumbnail"}
      />

      {/* Hover overlay */}
      <div className="card-overlay z-10">
        <p className="text-white text-sm font-bold line-clamp-1">{data.title}</p>
        {data.genre && (
          <p className="text-neutral-400 text-xs mt-0.5 line-clamp-1">{data.genre}</p>
        )}

        <div className="card-actions">
          <button
            onClick={() => router.push(`/watch/${data?.id}`)}
            className="w-9 h-9 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex justify-center items-center shadow-lg shadow-fuchsia-500/40 hover:scale-110 transition-transform"
          >
            <BsFillPlayFill size={22} className="text-white ml-0.5" />
          </button>

          <FavouriteBtn movieId={data?.id} profileId={profile?.id} />

          <button
            onClick={() => openModel(data?.id)}
            className="ml-auto w-9 h-9 border-2 border-white/60 rounded-full flex justify-center items-center hover:border-white hover:scale-110 transition-all"
          >
            <BiChevronDown className="text-white" size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
