"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
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
import { useInView, visitedPaths } from "@/hooks/useInView";
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
  const router = useRouter();
  const hasVisited = visitedPaths.has(router.pathname);
  const [activeCategory, setActiveCategory] = useState("All Movies");
  const isAll = activeCategory === "All Movies";
  const [gridRef, isGridInView] = useInView({ threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(hasVisited);

  useEffect(() => {
    if (!hasVisited) {
      setSectionInView(true);
    }
  }, [hasVisited]);

  /* ── Dynamic overlap — content slides up over billboard as it shrinks ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const billboard = section.previousElementSibling as HTMLElement;
        const billboardHeight = billboard?.offsetHeight || window.innerHeight * 0.7;
        const progress = Math.min(Math.max(scrollY / billboardHeight, 0), 1);

        if (progress > 0.5) {
          const overlapProgress = (progress - 0.5) / 0.5;
          section.style.marginTop = `${overlapProgress * -10}rem`;
        } else {
          section.style.marginTop = "0rem";
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      <div
        ref={sectionRef}
        className={`px-6 md:px-16 pt-10 pb-20 relative z-10 ${hasVisited ? "row-shown" : sectionInView ? "row-enter-active" : "row-enter"}`}
      >
        {/* Section heading */}
        <div className="mb-6 section-title">
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
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {movies.map((movie: any, i: number) => (
              <MoviePosterCard
                key={movie.id}
                data={movie}
                style={
                  hasVisited
                    ? undefined
                    : isGridInView
                    ? { animation: `gridCardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(i * 60, 600)}ms both` }
                    : { opacity: 0 }
                }
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
