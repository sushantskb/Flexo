// Shared (client + server safe) shape for the movie details page.
// Movies are created by the admin tool, so almost every rich field is optional
// and older documents only carry the core fields. Everything the details page
// renders goes through `normalizeMovie`, so components never have to guess
// whether a value is missing, blank, or stored in an unexpected format.

export interface CastMember {
  name: string;
  character: string | null;
  imageUrl: string | null;
}

export interface MovieExtra {
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: string | null;
}

export interface RelatedMovie {
  id: string;
  title: string;
  thumbnailUrl: string;
  genre: string;
  createdAt: string;
}

export interface MovieDetails {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  trailerUrl: string | null;
  thumbnailUrl: string;
  posterUrl: string;
  genre: string;
  genres: string[];
  duration: string | null;
  runtimeMinutes: number | null;
  year: number | null;
  maturityRating: string | null;
  imdbRating: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
  director: string | null;
  writers: string[];
  cast: CastMember[];
  studio: string | null;
  budget: string | null;
  awards: string | null;
  awardsNote: string | null;
  audioLanguages: string[];
  subtitleLanguages: string[];
  videoQualities: string[];
  extras: MovieExtra[];
  region: string | null;
  createdAt: string;
  related: RelatedMovie[];
}

type RawRecord = Record<string, any>;

const text = (value: unknown): string | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

// Accepts an array or a comma-separated string; trims and de-duplicates (case-insensitive).
const textList = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const seen = new Set<string>();
  return raw
    .map(text)
    .filter((item): item is string => {
      if (!item || seen.has(item.toLowerCase())) return false;
      seen.add(item.toLowerCase());
      return true;
    });
};

const score = (value: unknown, max: number): number | null => {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? "").replace("%", ""));
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
};

// Genres are stored inconsistently ("Comedy, Drama", " Adventure/Spy", "Action & Thriller").
export const parseGenres = (genre: unknown): string[] =>
  textList(typeof genre === "string" ? genre.split(/[,/|&]/) : genre);

// Understands "3h 49m", "149 min", "2 hrs 30 mins", "2:30" (h:mm), "2:30:00" and plain minutes.
export const parseRuntimeMinutes = (duration: unknown): number | null => {
  const value = text(duration)?.toLowerCase();
  if (!value) return null;

  let minutes: number | null = null;
  const clock = value.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);
  const hours = value.match(/(\d+(?:\.\d+)?)\s*h/);
  const mins = value.match(/(\d+)\s*m/);

  if (clock) {
    minutes = Number(clock[1]) * 60 + Number(clock[2]);
  } else if (hours || mins) {
    minutes = (hours ? parseFloat(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0);
  } else if (/^\d+$/.test(value)) {
    minutes = Number(value);
  }

  return minutes && minutes > 0 ? Math.round(minutes) : null;
};

export const formatRuntime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : `${m}m`;
};

const normalizeCast = (value: unknown): CastMember[] => {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return raw
    .map((member): CastMember | null => {
      if (typeof member === "string") return { name: member.trim(), character: null, imageUrl: null };
      if (member && typeof member === "object") {
        const m = member as RawRecord;
        return {
          name: text(m.name) ?? "",
          character: text(m.character ?? m.role),
          imageUrl: text(m.imageUrl ?? m.image),
        };
      }
      return null;
    })
    .filter((member): member is CastMember => !!member?.name);
};

const normalizeExtras = (value: unknown): MovieExtra[] =>
  (Array.isArray(value) ? value : []).flatMap((extra) => {
    const e = (extra ?? {}) as RawRecord;
    const videoUrl = text(e.videoUrl);
    if (!videoUrl) return [];
    return [
      {
        title: text(e.title) ?? "Bonus Clip",
        description: text(e.description),
        videoUrl,
        thumbnailUrl: text(e.thumbnailUrl),
        duration: text(e.duration),
      },
    ];
  });

const toYear = (releaseYear: unknown, createdAt: unknown): number | null => {
  const year = score(releaseYear, new Date().getFullYear() + 5);
  if (year && year >= 1870) return Math.floor(year);
  const date = createdAt ? new Date(createdAt as string) : null;
  return date && !isNaN(date.getTime()) ? date.getFullYear() : null;
};

const toIsoDate = (value: unknown): string => {
  const date = value ? new Date(value as string) : null;
  return date && !isNaN(date.getTime()) ? date.toISOString() : new Date(0).toISOString();
};

export const toRelatedMovie = (movie: RawRecord): RelatedMovie => ({
  id: String(movie.id),
  title: text(movie.title) ?? "Untitled",
  thumbnailUrl: text(movie.posterUrl) ?? text(movie.thumbnailUrl) ?? "",
  genre: parseGenres(movie.genre).join(" / "),
  createdAt: toIsoDate(movie.createdAt),
});

// Ranks candidates by shared genres (then same region), keeping the incoming order
// (newest first) as the tie-breaker so there is always something to recommend.
export const pickRelatedMovies = (movie: RawRecord, candidates: RawRecord[], limit = 6): RelatedMovie[] => {
  const genres = new Set(parseGenres(movie.genre).map((g) => g.toLowerCase()));

  return candidates
    .filter((candidate) => candidate.id !== movie.id)
    .map((candidate, index) => ({
      candidate,
      index,
      score:
        parseGenres(candidate.genre).filter((g) => genres.has(g.toLowerCase())).length * 2 +
        (movie.regionId && candidate.regionId === movie.regionId ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ candidate }) => toRelatedMovie(candidate));
};

export const normalizeMovie = (movie: RawRecord, related: RelatedMovie[] = []): MovieDetails => {
  const genres = parseGenres(movie.genre);
  const runtimeMinutes = parseRuntimeMinutes(movie.duration);
  const thumbnailUrl = text(movie.thumbnailUrl) ?? "";

  return {
    id: String(movie.id),
    title: text(movie.title) ?? "Untitled",
    description: text(movie.description) ?? "",
    videoUrl: text(movie.videoUrl) ?? "",
    trailerUrl: text(movie.trailerUrl),
    thumbnailUrl,
    posterUrl: text(movie.posterUrl) ?? thumbnailUrl,
    genre: genres.join(" / "),
    genres,
    duration: runtimeMinutes ? formatRuntime(runtimeMinutes) : text(movie.duration),
    runtimeMinutes,
    year: toYear(movie.releaseYear, movie.createdAt),
    maturityRating: text(movie.maturityRating),
    imdbRating: score(movie.imdbRating, 10),
    rottenTomatoes: score(movie.rottenTomatoes, 100),
    metacritic: score(movie.metacritic, 100),
    director: text(movie.director),
    writers: textList(movie.writers),
    cast: normalizeCast(movie.cast),
    studio: text(movie.studio),
    budget: text(movie.budget),
    awards: text(movie.awards),
    awardsNote: text(movie.awardsNote),
    audioLanguages: textList(movie.audioLanguages),
    subtitleLanguages: textList(movie.subtitleLanguages),
    videoQualities: textList(movie.videoQualities),
    extras: normalizeExtras(movie.extras),
    region: text(movie.region?.region),
    createdAt: toIsoDate(movie.createdAt),
    related,
  };
};
