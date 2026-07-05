import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";
import { useRouter } from "next/router";

interface SeriesCardProps {
  data: Record<string, any>;
}

const isNewlyAdded = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= 7;
};

const formatNote = (note?: string) => {
  if (!note) return "";
  return note
    .replace(/New episodes added to Season\s*(\d+)/i, "New Eps • S$1")
    .replace(/New episode added to Season\s*(\d+)/i, "New Ep • S$1")
    .replace(/Episodes added to Season\s*(\d+)/i, "Eps • S$1")
    .replace(/Episode added to Season\s*(\d+)/i, "Ep • S$1")
    .replace(/Season\s*(\d+)\s*added/i, "S$1 Added")
    .replace(/Season\s*(\d+)\s*removed/i, "S$1 Removed")
    .replace(/New episodes added/i, "New Eps")
    .replace(/New episode added/i, "New Ep")
    .replace(/Episodes added/i, "Eps")
    .replace(/Episode added/i, "Ep");
};

const SeriesCard: React.FC<SeriesCardProps> = ({ data }) => {
  const router = useRouter();
  const seasonCount = data.seasons?.length ?? 0;
  const isNew = isNewlyAdded(data.createdAt);

  return (
    <div className="card-row group relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-fuchsia-500/50 cursor-pointer">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[85%]">
        {isNew && (
          <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-lg shadow-fuchsia-500/30 whitespace-nowrap">
            New
          </span>
        )}
        {data.lastModifiedNote && !isNew && (
          <span
            className="bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] inline-block"
            title={data.lastModifiedNote}
          >
            {formatNote(data.lastModifiedNote)}
          </span>
        )}
      </div>

      {/* Poster */}
      <img
        className="w-full h-full object-cover"
        src={data.thumbnailUrl || "/placeholder.jpg"}
        alt={data.title}
      />

      {/* Hover overlay */}
      <div className="card-overlay z-10">
        <p className="text-white text-sm font-bold line-clamp-1">{data.title}</p>
        <p className="text-neutral-400 text-xs mt-0.5 line-clamp-1">
          {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"}
          {data.genre ? ` • ${data.genre}` : ""}
        </p>

        <div className="card-actions">
          <button
            onClick={() => router.push(`/series/${data.id}`)}
            className="w-9 h-9 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex justify-center items-center shadow-lg shadow-fuchsia-500/40 hover:scale-110 transition-transform"
          >
            <BsFillPlayFill size={22} className="text-white ml-0.5" />
          </button>

          <button
            onClick={() => router.push(`/series/${data.id}`)}
            className="ml-auto w-9 h-9 border-2 border-white/60 rounded-full flex justify-center items-center hover:border-white hover:scale-110 transition-all"
          >
            <BiChevronDown className="text-white" size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;
