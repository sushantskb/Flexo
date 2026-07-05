import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/router";

interface SeriesPosterCardProps {
  data: Record<string, any>;
}

const isNewlyAdded = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= 7;
};

const SeriesPosterCard: React.FC<SeriesPosterCardProps> = ({ data }) => {
  const router = useRouter();
  const seasonCount = data.seasons?.length ?? 0;
  const goToSeries = () => router.push(`/series/${data.id}`);

  return (
    <div className="group cursor-pointer" onClick={goToSeries}>
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-fuchsia-500/40 transition duration-300">
        {isNewlyAdded(data.createdAt) && (
          <span className="absolute top-3 left-3 z-20 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-lg shadow-fuchsia-500/30">
            New
          </span>
        )}

        <img
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          src={data.thumbnailUrl || "/placeholder.jpg"}
          alt={data.title || "Thumbnail"}
        />

        {/* Hover overlay with centered actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSeries();
            }}
            className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg hover:scale-105 transition"
            aria-label="Play"
          >
            <BsFillPlayFill size={26} className="text-black ml-0.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSeries();
            }}
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex justify-center items-center hover:bg-white/30 transition"
            aria-label="More info"
          >
            <AiOutlineInfoCircle size={22} className="text-white" />
          </button>
        </div>
      </div>

      {/* Meta below poster */}
      <div className="mt-3 px-0.5">
        <p className="text-white text-base font-bold line-clamp-1 group-hover:text-fuchsia-400 transition">
          {data.title}
        </p>
        <p className="text-neutral-400 text-sm mt-1 line-clamp-1">
          <span className="text-neutral-300">
            {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"}
          </span>
          {data.genre && <span className="mx-1.5 text-neutral-600">•</span>}
          {data.genre}
        </p>
      </div>
    </div>
  );
};

export default SeriesPosterCard;
