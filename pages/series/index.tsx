"use client";

import React, { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SeriesBillboard from "@/components/SeriesBillboard";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import CategoryTabs from "@/components/CategoryTabs";
import PosterGridSkeleton from "@/components/PosterGridSkeleton";
import Footer from "@/components/Footer";
import NoData from "@/components/NoData";
import useSeriesList from "@/hooks/useSeriesList";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

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
  "All Shows",
  "Drama",
  "Comedy",
  "Thriller",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Fantasy",
  "Crime",
  "Mystery",
  "Romance",
  "Anime",
  "Animation",
  "Documentary",
];

export default function SeriesPage() {
  const [activeCategory, setActiveCategory] = useState("All Shows");
  const isAll = activeCategory === "All Shows";

  const { data: seriesList = [], isLoading } = useSeriesList();

  const shows = useMemo(() => {
    if (isAll) return seriesList;
    return seriesList.filter((s: any) =>
      s.genre?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [seriesList, activeCategory, isAll]);

  return (
    <>
      <Navbar />
      <SeriesBillboard />

      <div className="px-6 md:px-16 pt-10 pb-20">
        {/* Section heading */}
        <div className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            {isAll ? "Browse TV Shows" : `${activeCategory} Shows`}
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5">
            {isLoading
              ? "Loading titles…"
              : `${shows.length} show${shows.length === 1 ? "" : "s"} ${
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
        ) : shows.length === 0 ? (
          <NoData
            variant="series"
            title="No shows found"
            description={`We couldn't find any ${
              isAll ? "" : activeCategory + " "
            }shows right now. Please check back later.`}
            actionLabel="View All Shows"
            onAction={() => setActiveCategory("All Shows")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {shows.map((series: any) => (
              <SeriesPosterCard key={series.id} data={series} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
