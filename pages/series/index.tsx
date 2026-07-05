"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import SeriesBillboard from "@/components/SeriesBillboard";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import CategoryTabs from "@/components/CategoryTabs";
import PosterGridSkeleton from "@/components/PosterGridSkeleton";
import Footer from "@/components/Footer";
import NoData from "@/components/NoData";
import useSeriesList from "@/hooks/useSeriesList";
import { useInView, visitedPaths } from "@/hooks/useInView";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const hasVisited = visitedPaths.has(router.pathname);
  const [activeCategory, setActiveCategory] = useState("All Shows");
  const isAll = activeCategory === "All Shows";
  const [gridRef, isGridInView] = useInView({ threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(hasVisited);

  const { data: seriesList = [], isLoading } = useSeriesList();

  useEffect(() => {
    if (!hasVisited) {
      setSectionInView(true);
    }
  }, [hasVisited]);

  /* ── Dynamic overlap ── */
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

      <div
        ref={sectionRef}
        className={`px-6 md:px-16 pt-10 pb-20 relative z-10 ${hasVisited ? "row-shown" : sectionInView ? "row-enter-active" : "row-enter"}`}
      >
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
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {shows.map((series: any, i: number) => (
              <SeriesPosterCard
                key={series.id}
                data={series}
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
