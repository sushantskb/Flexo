import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/router";
import { useTilt } from "@/hooks/useTilt";

interface SeriesPosterCardProps {
  data: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
}

const isNewlyAdded = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= 7;
};

const SeriesPosterCard: React.FC<SeriesPosterCardProps> = ({ data, style, className }) => {
  const router = useRouter();
  const seasonCount = data.seasons?.length ?? 0;
  const goToSeries = () => router.push(`/series/${data.id}`);
  const { ref, handleMove, handleLeave } = useTilt({ maxTilt: 14, scale: 1.06 });

  return (
    <div
      className={`group cursor-pointer ${className ?? ""}`}
      style={style}
      onClick={goToSeries}
    >
      {/* Poster with 3D tilt */}
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="card-poster relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-fuchsia-500/50"
      >
        {isNewlyAdded(data.createdAt) && (
          <span className="absolute top-3 left-3 z-20 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-lg shadow-fuchsia-500/30">
            New
          </span>
        )}

        <img
          className="w-full h-full object-cover"
          src={data.thumbnailUrl || "/placeholder.jpg"}
          alt={data.title || "Thumbnail"}
        />

        {/* Hover overlay with centered actions */}
        <div className="poster-overlay">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSeries();
            }}
            className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg hover:bg-neutral-200 transition-colors"
            aria-label="Play"
          >
            <BsFillPlayFill size={26} className="text-black ml-0.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToSeries();
            }}
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex justify-center items-center hover:bg-white/30 transition-colors"
            aria-label="More info"
          >
            <AiOutlineInfoCircle size={22} className="text-white" />
          </button>
        </div>
      </div>

      {/* Meta below poster */}
      <div className="poster-meta mt-3 px-0.5">
        <p className="text-white text-base font-bold line-clamp-1 group-hover:text-fuchsia-400 transition-colors">
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
