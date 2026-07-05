"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Billboard from "@/components/Billboard";
import InfoModel from "@/components/InfoModel";
import MoviePosterCard from "@/components/MoviePosterCard";
import Footer from "@/components/Footer";
import NoData from "@/components/NoData";
import useMovieList from "@/hooks/useMovieList";
import useCatMovies from "@/hooks/useCatMovies";
import useModelInfo from "@/hooks/useModelInfo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const CATEGORIES = [
  "All Movies",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Fantasy",
  "Thriller",
  "Drama",
  "Horror",
  "Mystery",
  "Crime",
  "Spy",
  "Comedy",
  "Romance",
  "Anime",
  "Animation",
  "Documentary",
  "Musical",
  "Family",
  "History",
];

const PosterGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-2xl bg-neutral-800 ring-1 ring-white/5" />
        <div className="h-4 w-3/4 mt-3 rounded bg-neutral-800" />
        <div className="h-3 w-1/2 mt-2 rounded bg-neutral-800/70" />
      </div>
    ))}
  </div>
);

export default function MoviesPage() {
  const [activeCategory, setActiveCategory] = useState("All Movies");
  const isAll = activeCategory === "All Movies";

  const { data: allMovies = [], isLoading: allLoading } = useMovieList();
  const { data: catMovies = [], isLoading: catLoading } = useCatMovies(
    isAll ? "" : activeCategory
  );

  const movies = isAll ? allMovies : catMovies;
  const isLoading = isAll ? allLoading : catLoading;

  const { isOpen, closeModel } = useModelInfo();

  return (
    <>
      <InfoModel visible={isOpen} onClose={closeModel} />
      <Navbar />
      <Billboard />

      <div className="px-6 md:px-16 pt-10 pb-20">
        {/* Section heading */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {isAll ? "Browse Movies" : `${activeCategory} Movies`}
            </h1>
            <p className="text-neutral-400 text-sm mt-1.5">
              {isLoading
                ? "Loading titles…"
                : `${movies.length} title${movies.length === 1 ? "" : "s"} ${
                    isAll ? "available" : "found"
                  }`}
            </p>
          </div>
        </div>

        {/* Category tabs — horizontal scroller with edge fades */}
        <div className="relative mb-10">
          <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-black to-transparent z-10" />

          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-2 px-1">
            {CATEGORIES.map((category) => {
              const active = category === activeCategory;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30 scale-105"
                      : "bg-white/[0.04] text-neutral-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white hover:ring-white/20"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <PosterGridSkeleton />
        ) : movies.length === 0 ? (
          <NoData
            title="No movies found"
            description={`We couldn't find any ${
              isAll ? "" : activeCategory + " "
            }movies right now. Please check back later.`}
            actionLabel="View All Movies"
            onAction={() => setActiveCategory("All Movies")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {movies.map((movie: any) => (
              <MoviePosterCard key={movie.id} data={movie} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
