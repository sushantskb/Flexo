"use client";

import useBillboard from "@/hooks/useBillbord";
import React, { useCallback, useMemo, useState } from "react";
import { BsFillPlayFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
import { useRouter } from "next/router";
import axios from "axios";

import "@vidstack/react/player/styles/base.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import NoData from "./NoData";
import Loader from "./Loader";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";
import { useSelectionStore } from "@/zustand/useSelectStore";

const Billboard = () => {
  const { data, isLoading } = useBillboard();
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);

  const { profile } = useSelectionStore();
  const { data: currentUser, mutate: mutateUser } = useCurrentUser();
  const { data: favMovies, mutate: mutateFavourite } = useFavourites({
    profileId: profile?.id,
  });

  const isFavourite = useMemo(() => {
    if (!data?.id || !Array.isArray(favMovies)) return false;
    return favMovies.some((m: any) => m?.id === data.id);
  }, [favMovies, data?.id]);

  const toggleFavourite = useCallback(async () => {
    if (!data?.id) return;

    const isProfileMode = !!profile?.id;
    const url = isProfileMode
      ? `/api/favourite?email=${currentUser?.email}&isProfile=true&profileId=${profile?.id}`
      : `/api/favourite?email=${currentUser?.email}`;

    try {
      if (isFavourite) {
        await axios.delete(url, { data: { movieId: data.id } });
      } else {
        await axios.post(url, { movieId: data.id });
      }
      mutateFavourite();
      mutateUser();
    } catch (err) {
      console.log(err);
    }
  }, [data?.id, isFavourite, profile?.id, currentUser?.email, mutateFavourite, mutateUser]);

  if (!data && !isLoading) {
    return (
      <NoData title="No movies found" description="Our Team is working on it" />
    );
  }
  if (isLoading) {
    return <Loader />;
  }

  // Derive meta from real API data
  const genres: string[] = (data?.genre || "")
    .split(/[,&/|]/)
    .map((g: string) => g.trim())
    .filter(Boolean);

  const year = data?.createdAt ? new Date(data.createdAt).getFullYear() : null;
  const rating = data?.rating;

  return (
    <div className="relative w-full h-[85vh] md:h-[92vh] overflow-hidden">
      {/* Thumbnail (shown until video loads) */}
      {!isLoaded && (
        <img
          src={data?.thumbnailUrl || ""}
          alt={data?.title || "thumbnail"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Trailer */}
      {data?.trailerUrl && (
        <MediaPlayer
          src={data.trailerUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full"
          onCanPlay={() => setIsLoaded(true)}
        >
          <MediaProvider
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </MediaPlayer>
      )}

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-[8%] md:bottom-[14%] left-4 md:left-16 right-4 md:right-auto max-w-2xl">
        {/* Badge + rating */}
        <div className="flex items-center gap-4 mb-5">
          <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[11px] md:text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase shadow-lg shadow-fuchsia-500/20">
            Flixo Original
          </span>
          {rating && (
            <span className="flex items-center gap-1.5 text-white/90 text-sm font-semibold">
              <AiFillStar className="text-yellow-400" size={18} />
              {rating} IMDb
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl uppercase leading-[0.95]">
          {data?.title}
        </h1>

        {/* Description */}
        <p className="hidden sm:block text-neutral-300 text-sm md:text-lg mt-5 max-w-xl leading-relaxed line-clamp-3">
          {data?.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-neutral-300 text-sm md:text-base font-medium">
          {genres.map((g, i) => (
            <React.Fragment key={g}>
              {i > 0 && <span className="text-neutral-600">•</span>}
              <span>{g}</span>
            </React.Fragment>
          ))}
          {data?.duration && (
            <>
              <span className="text-neutral-600">•</span>
              <span>{data.duration}</span>
            </>
          )}
          {year && (
            <>
              <span className="text-neutral-600">•</span>
              <span>{year}</span>
            </>
          )}
          <span className="ml-1 border border-neutral-500 rounded px-1.5 py-0.5 text-xs text-neutral-300">
            18+
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-9">
          <button
            onClick={() => router.push(`/watch/${data?.id}`)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold hover:opacity-90 transition shadow-lg shadow-fuchsia-500/30"
          >
            <BsFillPlayFill size={26} />
            Watch Now
          </button>

          <button
            onClick={toggleFavourite}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold hover:bg-white/20 transition"
          >
            {isFavourite ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
            My List
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billboard;
