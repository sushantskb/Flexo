import React, { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Building2,
  ChevronRight,
  Film,
  Languages,
  LucideIcon,
  MessageSquareQuote,
  Play,
} from "lucide-react";

import MoviePosterCard from "@/components/MoviePosterCard";
import { useInView } from "@/hooks/useInView";
import { CastMember, MovieDetails, MovieExtra } from "@/lib/movieDetails";

interface MovieDetailSectionsProps {
  movie: MovieDetails;
  onPlayClip: (clip: MovieExtra) => void;
}

type Falsy = false | null | undefined | 0 | "";
const compact = <T,>(items: (T | Falsy)[]): T[] => items.filter(Boolean) as T[];

const CAST_PREVIEW = 6;
const LANGUAGE_PREVIEW = 4;

/* ── Building blocks ─────────────────────────────────────────────────────── */

const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [ref, inView, hasVisited] = useInView<HTMLElement>({ threshold: 0.1 });
  return (
    <section
      ref={ref}
      className={`${hasVisited ? "row-shown" : inView ? "row-enter-active" : "row-enter"} ${className}`}
    >
      {children}
    </section>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 md:p-7 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) => (
  <h3 className="flex items-center gap-2.5 text-sm font-semibold text-white">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-500/20">
      <Icon className="h-4 w-4" />
    </span>
    {children}
  </h3>
);

const CardEyebrow = ({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) => (
  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
    <Icon className="h-3.5 w-3.5 text-fuchsia-300" />
    {children}
  </p>
);

const SectionHeading = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="mb-5 flex items-center justify-between gap-4">
    <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">{children}</h2>
    {action}
  </div>
);

const ToggleLink = ({ onClick, open, children }: { onClick: () => void; open: boolean; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-sm font-semibold text-neutral-300 transition-colors hover:text-white"
  >
    {children}
    <ChevronRight className={`h-4 w-4 transition-transform ${open ? "-rotate-90" : ""}`} />
  </button>
);

const CastCard = ({ member }: { member: CastMember }) => {
  const [failed, setFailed] = useState(false);
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group flex flex-col items-center text-center">
      <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/10 transition group-hover:ring-fuchsia-500/60 md:h-24 md:w-24">
        {member.imageUrl && !failed ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-fuchsia-600/40 to-violet-800/40 text-lg font-bold text-white/80">
            {initials}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold leading-tight text-white">{member.name}</p>
      {member.character && (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{member.character}</p>
      )}
    </div>
  );
};

/* ── Sections ────────────────────────────────────────────────────────────── */

const MovieDetailSections: React.FC<MovieDetailSectionsProps> = ({ movie, onPlayClip }) => {
  const [showFullCast, setShowFullCast] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Credits under the synopsis; genre/region stand in when no crew data exists.
  const crew = compact([
    movie.director && { label: "Director", value: movie.director },
    movie.writers.length > 0 && { label: movie.writers.length > 1 ? "Writers" : "Writer", value: movie.writers.join(", ") },
  ]);
  const storyFacts = crew.length
    ? crew
    : compact([
        movie.genres.length > 0 && { label: movie.genres.length > 1 ? "Genres" : "Genre", value: movie.genres.join(", ") },
        movie.region && { label: "Region", value: movie.region },
      ]);

  const hasProduction = !!(movie.studio || movie.budget);
  const glance = compact([
    movie.duration && { label: "Runtime", value: movie.duration },
    movie.maturityRating && { label: "Rated", value: movie.maturityRating },
    {
      label: "Added",
      value: new Date(movie.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
  ]);

  const clips = useMemo(() => {
    const list = [...movie.extras];
    if (movie.trailerUrl && !list.some((clip) => clip.videoUrl === movie.trailerUrl)) {
      list.unshift({
        title: "Official Trailer",
        description: `First look at ${movie.title}.`,
        videoUrl: movie.trailerUrl,
        thumbnailUrl: null,
        duration: null,
      });
    }
    return list;
  }, [movie]);

  const languages = useMemo(() => {
    const byName = new Map<string, { name: string; audio: boolean; subtitles: boolean }>();
    const add = (name: string, kind: "audio" | "subtitles") => {
      const key = name.toLowerCase();
      const entry = byName.get(key) ?? { name, audio: false, subtitles: false };
      entry[kind] = true;
      byName.set(key, entry);
    };
    movie.audioLanguages.forEach((name) => add(name, "audio"));
    movie.subtitleLanguages.forEach((name) => add(name, "subtitles"));
    return Array.from(byName.values());
  }, [movie]);

  const scores = compact([
    movie.rottenTomatoes !== null && {
      label: "Rotten Tomatoes",
      value: `${Math.round(movie.rottenTomatoes)}%`,
      mark: <span className="h-2.5 w-2.5 rounded-full bg-red-500" />,
    },
    movie.metacritic !== null && {
      label: "Metacritic",
      value: String(Math.round(movie.metacritic)),
      mark: <span className="rounded-sm bg-emerald-500 px-1 text-[8px] font-black text-black">MC</span>,
    },
    movie.imdbRating !== null && {
      label: "IMDb",
      value: movie.imdbRating.toFixed(1),
      mark: <span className="rounded-sm bg-[#f5c518] px-1 text-[8px] font-black text-black">IMDb</span>,
    },
  ]);

  const visibleCast = showFullCast ? movie.cast : movie.cast.slice(0, CAST_PREVIEW);
  const visibleLanguages = showAllLanguages ? languages : languages.slice(0, LANGUAGE_PREVIEW);

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 pb-24 pt-4 md:px-12">
      {/* ── Story + side facts ── */}
      <Reveal className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={BookOpen}>The Story</CardTitle>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">
            {movie.description || "A synopsis for this title isn't available yet."}
          </p>
          {storyFacts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-6">
              {storyFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">{fact.label}</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          {movie.awards && (
            <Card className="flex-1">
              <CardEyebrow icon={Award}>Awards</CardEyebrow>
              <p className="mt-3 text-xl font-bold text-white">{movie.awards}</p>
              {movie.awardsNote && <p className="mt-1 text-sm text-neutral-400">{movie.awardsNote}</p>}
            </Card>
          )}

          {hasProduction && (
            <Card className="flex-1">
              <CardEyebrow icon={Building2}>Production</CardEyebrow>
              <p className="mt-3 text-xl font-bold text-white">{movie.studio ?? `Budget: ${movie.budget}`}</p>
              {movie.studio && movie.budget && <p className="mt-1 text-sm text-neutral-400">Budget: {movie.budget}</p>}
            </Card>
          )}

          {!movie.awards && !hasProduction && (
            <Card className="flex-1">
              <CardEyebrow icon={Film}>At a Glance</CardEyebrow>
              <dl className="mt-4 space-y-3">
                {glance.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-neutral-400">{fact.label}</dt>
                    <dd className="font-semibold text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </div>
      </Reveal>

      {/* ── Trailers & extras ── */}
      {clips.length > 0 && (
        <Reveal>
          <SectionHeading>Trailers &amp; Behind the Scenes</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((clip) => (
              <button key={clip.videoUrl} type="button" onClick={() => onPlayClip(clip)} className="group text-left">
                <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10 transition group-hover:ring-fuchsia-500/50">
                  {(clip.thumbnailUrl || movie.thumbnailUrl) && (
                    <img
                      src={clip.thumbnailUrl || movie.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 scale-75 place-items-center rounded-full bg-white/15 opacity-0 ring-1 ring-white/30 backdrop-blur-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                    </span>
                  </span>
                  {clip.duration && (
                    <span className="absolute bottom-2.5 right-2.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {clip.duration}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-white transition-colors group-hover:text-fuchsia-300">
                  {clip.title}
                </p>
                {clip.description && <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">{clip.description}</p>}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Cast ── */}
      {movie.cast.length > 0 && (
        <Reveal>
          <SectionHeading
            action={
              movie.cast.length > CAST_PREVIEW && (
                <ToggleLink open={showFullCast} onClick={() => setShowFullCast((open) => !open)}>
                  {showFullCast ? "Show Less" : "Full Cast"}
                </ToggleLink>
              )
            }
          >
            Starring Cast
          </SectionHeading>
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6">
            {visibleCast.map((member) => (
              <CastCard key={`${member.name}-${member.character ?? ""}`} member={member} />
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Languages + critic scores ── */}
      {(languages.length > 0 || scores.length > 0) && (
        <Reveal className={`grid gap-5 ${languages.length > 0 && scores.length > 0 ? "lg:grid-cols-2" : ""}`}>
          {languages.length > 0 && (
            <Card>
              <CardTitle icon={Languages}>Audio &amp; Subtitles</CardTitle>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {visibleLanguages.map((language) => (
                  <div
                    key={language.name}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3 text-sm"
                  >
                    <span className="text-neutral-200">{language.name}</span>
                    <span className="flex gap-1.5">
                      {language.audio && (
                        <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                          Audio
                        </span>
                      )}
                      {language.subtitles && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                          CC
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {languages.length > LANGUAGE_PREVIEW && (
                <button
                  type="button"
                  onClick={() => setShowAllLanguages((open) => !open)}
                  className="mt-4 w-full text-center text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
                >
                  {showAllLanguages ? "Show fewer languages" : `+ ${languages.length - LANGUAGE_PREVIEW} more languages`}
                </button>
              )}
            </Card>
          )}

          {scores.length > 0 && (
            <Card className="flex flex-col">
              <CardTitle icon={MessageSquareQuote}>Critic Scores</CardTitle>
              <div
                className="my-auto grid divide-x divide-white/10 pt-6"
                style={{ gridTemplateColumns: `repeat(${scores.length}, minmax(0, 1fr))` }}
              >
                {scores.map((item) => (
                  <div key={item.label} className="flex flex-col items-center px-2 text-center">
                    <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">{item.value}</span>
                    <span className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                      {item.mark}
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Reveal>
      )}

      {/* ── More like this ── */}
      {movie.related.length > 0 && (
        <Reveal>
          <SectionHeading>More Like This</SectionHeading>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {movie.related.map((related) => (
              <MoviePosterCard key={related.id} data={related} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
};

export default MovieDetailSections;
