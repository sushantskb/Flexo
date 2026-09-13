import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, Clapperboard, Play, Plus, Share2, ThumbsUp } from "lucide-react";

import useCurrentUser from "@/hooks/useCurrentUser";
import useCurrentProfile from "@/hooks/useGetProfile";
import useFavourites from "@/hooks/useFavourites";
import { useSelectionStore } from "@/zustand/useSelectStore";
import { formatRuntime, MovieDetails } from "@/lib/movieDetails";

export interface ResumeInfo {
  currentTime: number;
  duration: number;
  percentage: number;
}

interface MovieHeroProps {
  movie: MovieDetails;
  resume: ResumeInfo | null;
  onPlay: () => void;
  onTrailer?: () => void;
}

const NEW_RELEASE_DAYS = 14;

// Splits the title into a white line and a gradient line at the word boundary that
// best balances their lengths ("The Neon Protocol" → "The Neon" / "Protocol").
const splitTitle = (title: string): [string, string] => {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return [title, ""];

  const imbalance = (cut: number) =>
    Math.abs(words.slice(0, cut).join(" ").length - words.slice(cut).join(" ").length);

  let best = 1;
  for (let cut = 2; cut < words.length; cut++) {
    if (imbalance(cut) < imbalance(best)) best = cut;
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
};

const IconButton = ({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={`liquid-glass relative grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 ${
      active ? "text-fuchsia-300" : "text-white"
    }`}
  >
    {children}
  </button>
);

const MovieHero: React.FC<MovieHeroProps> = ({ movie, resume, onPlay, onTrailer }) => {
  const [entered, setEntered] = useState(false);
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  /* ── My List ── */
  const { profile } = useSelectionStore();
  const profileId = profile?.id;
  const { data: currentUser, mutate: mutateUser } = useCurrentUser();
  const { data: currentProfile, mutate: mutateProfile } = useCurrentProfile({ profileId });
  const { mutate: mutateFavourite } = useFavourites({ profileId });

  const isProfileMode = !!profileId;
  const favIds: string[] = (isProfileMode ? currentProfile?.favouriteIds : currentUser?.favouriteIds) || [];
  const isFavourite = favIds.includes(movie.id);

  const toggleFavourite = async () => {
    const url = isProfileMode
      ? `/api/favourite?email=${currentUser?.email}&isProfile=true&profileId=${profileId}`
      : `/api/favourite?email=${currentUser?.email}`;

    try {
      const response = isFavourite
        ? await axios.delete(url, { data: { movieId: movie.id } })
        : await axios.post(url, { movieId: movie.id });

      const updatedFavouriteIds = response?.data?.favouriteIds;
      if (isProfileMode) {
        mutateProfile({ ...currentProfile, favouriteIds: updatedFavouriteIds }, false);
      } else {
        mutateUser({ ...currentUser, favouriteIds: updatedFavouriteIds }, false);
      }
      mutateFavourite();
    } catch (err) {
      console.log(err);
    }
  };

  /* ── Like (per-browser preference; there is no ratings backend yet) ── */
  const likeKey = `flixo:liked:${movie.id}`;

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(likeKey) === "1");
    } catch {}
  }, [likeKey]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(likeKey, "1");
      else localStorage.removeItem(likeKey);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movie.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  };

  /* ── Entrance reveal, one frame after mount ── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    setBackdropFailed(false);
    setPosterFailed(false);
  }, [movie.id]);

  const reveal = (delay: number): React.CSSProperties | undefined =>
    entered ? { animation: `revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards` } : undefined;

  const [titleTop, titleBottom] = splitTitle(movie.title);

  // Quality badges when the admin provided them, otherwise honest facts we do have.
  const tags = movie.videoQualities.length
    ? movie.videoQualities
    : [movie.maturityRating, movie.region].filter((tag): tag is string => !!tag);

  const posterBadges = [
    ((movie.imdbRating ?? 0) >= 8 || (movie.rottenTomatoes ?? 0) >= 85) && {
      label: "Top Rated",
      className: "bg-[#f5c518] text-black",
    },
    Date.now() - new Date(movie.createdAt).getTime() <= NEW_RELEASE_DAYS * 86400000 && {
      label: "New",
      className: "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white",
    },
  ].filter((badge): badge is { label: string; className: string } => !!badge);

  const resumePercent = resume ? Math.round(Math.min(100, Math.max(0, resume.percentage))) : 0;
  const remainingMinutes = resume ? Math.round((resume.duration - resume.currentTime) / 60) : 0;
  const remainingLabel = remainingMinutes >= 1 ? `${formatRuntime(remainingMinutes)} remaining` : "Almost done";

  const meta = [movie.year && String(movie.year), movie.duration, movie.genre].filter(
    (item): item is string => !!item
  );

  return (
    <section className="relative isolate flex min-h-[88vh] w-full items-end overflow-hidden">
      {/* ── Backdrop ── */}
      <div className="absolute inset-0 -z-10">
        {movie.thumbnailUrl && !backdropFailed ? (
          <img
            src={movie.thumbnailUrl}
            alt=""
            onError={() => setBackdropFailed(true)}
            className="h-full w-full scale-105 object-cover opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-950 via-[#08080b] to-fuchsia-950/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080b] via-[#08080b]/80 to-[#08080b]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-[#08080b]/30 to-black/60" />
        <div className="aurora-blob-1 absolute -bottom-[25%] -left-[10%]" />
        <div className="aurora-blob-2 absolute -top-[15%] right-[5%]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-end gap-12 px-6 pb-16 pt-32 md:px-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-20">
        {/* ── Left: title + actions ── */}
        <div className="max-w-3xl">
          {tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 opacity-0" style={reveal(0.1)}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1
            className="text-[2.75rem] font-semibold uppercase leading-[0.92] tracking-tight text-white opacity-0 drop-shadow-2xl sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
            style={reveal(0.2)}
          >
            <span className="block">{titleTop}</span>
            {titleBottom && (
              <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text pb-1 text-transparent">
                {titleBottom}
              </span>
            )}
          </h1>

          <div
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-neutral-300 opacity-0"
            style={reveal(0.3)}
          >
            {movie.imdbRating !== null && (
              <span className="flex items-center gap-1.5">
                <span className="rounded bg-[#f5c518] px-1.5 py-0.5 text-[10px] font-black text-black">IMDb</span>
                <span className="font-semibold text-white">{movie.imdbRating.toFixed(1)}</span>
              </span>
            )}
            {meta.map((item, i) => (
              <React.Fragment key={item}>
                {(i > 0 || movie.imdbRating !== null) && <span className="text-neutral-600">•</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 opacity-0" style={reveal(0.4)}>
            <button
              type="button"
              onClick={onPlay}
              className="btn-rotate-border relative flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/50 active:scale-95"
            >
              <Play className="h-5 w-5 fill-white" />
              {resume ? "Resume" : "Watch Now"}
            </button>

            {onTrailer && (
              <button
                type="button"
                onClick={onTrailer}
                className="liquid-glass relative flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
              >
                <Clapperboard className="h-5 w-5" />
                Watch Trailer
              </button>
            )}

            <IconButton label={isFavourite ? "Remove from My List" : "Add to My List"} active={isFavourite} onClick={toggleFavourite}>
              {isFavourite ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </IconButton>
            <IconButton label={liked ? "Liked" : "Like"} active={liked} onClick={toggleLike}>
              <ThumbsUp className={`h-5 w-5 ${liked ? "fill-fuchsia-300/30" : ""}`} />
            </IconButton>
            <IconButton label={linkCopied ? "Link copied" : "Share"} active={linkCopied} onClick={handleShare}>
              {linkCopied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </IconButton>
          </div>

          {resume && (
            <p className="mt-5 text-xs font-medium text-neutral-400 lg:hidden">
              <span className="text-fuchsia-300">{resumePercent}% watched</span> · {remainingLabel}
            </p>
          )}
        </div>

        {/* ── Right: poster + playback card ── */}
        <div className="hidden opacity-0 lg:block" style={reveal(0.35)}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl shadow-fuchsia-950/40 ring-1 ring-white/10">
            {movie.posterUrl && !posterFailed ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onError={() => setPosterFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-fuchsia-900/40 to-violet-950">
                <Clapperboard className="h-12 w-12 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {posterBadges.length > 0 && (
              <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
                {posterBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-lg ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="liquid-glass relative mt-4 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">{resume ? "Resume Playing" : "Ready to Watch"}</span>
              {resume ? (
                <span className="text-fuchsia-300">{resumePercent}%</span>
              ) : (
                movie.duration && <span className="text-neutral-400">{movie.duration}</span>
              )}
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                style={{ width: `${resumePercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">
              {resume ? remainingLabel : "Start from the beginning"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieHero;
