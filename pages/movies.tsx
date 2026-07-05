"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Billboard from "@/components/Billboard";
import InfoModel from "@/components/InfoModel";
import MoviePosterCard from "@/components/MoviePosterCard";
import CategoryTabs from "@/components/CategoryTabs";
import PosterGridSkeleton from "@/components/PosterGridSkeleton";
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
        <div className="mb-6">
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

        {/* Category tabs */}
        <CategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {/* Grid */}
        {isLoading ? (
          <PosterGridSkeleton />
        ) : movies.length === 0 ? (
          <NoData
            variant="movie"
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
