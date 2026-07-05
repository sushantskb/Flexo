"use client";

import React, { useEffect, useRef, useState } from "react";
import Billboard from "@/components/Billboard";
import InfoModel from "@/components/InfoModel";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import useFavourites from "@/hooks/useFavourites";
import useModelInfo from "@/hooks/useModelInfo";
import useMovieList from "@/hooks/useMovieList";
import useSeriesList from "@/hooks/useSeriesList";
import SeriesList from "@/components/SeriesList";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import useWatchProgress from "@/hooks/useWatchProgress";
import { useSelectionStore } from "@/zustand/useSelectStore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import SkelletonWrapper from "@/components/SkelletonWrapper";
import useRegions from "@/hooks/useRegions";
import { useRouter } from "next/router";
import { visitedPaths } from "@/hooks/useInView";
import LandingPage from "@/components/LandingPage";
import Footer from "@/components/Footer";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      isAuthenticated: !!session,
    },
  };
}

function HomeDashboard() {
  const router = useRouter();
  const hasVisited = visitedPaths.has(router.pathname);
  const { data: movies = [], isLoading } = useMovieList();
  const { data: seriesList = [], isLoading: isSeriesLoading } = useSeriesList();
  const { profile } = useSelectionStore();
  const { data: regions = [], isLoading: isRegionsLoading } = useRegions();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionInView, setSectionInView] = useState(hasVisited);

  const { data: favMovies, isLoading: isFavLoading } = useFavourites({
    profileId: profile?.id,
  });

  const { data: continueWatching, isLoading: isContinueLoading, mutate: mutateContinue } = useWatchProgress(
    profile?.id
  );

  const { isOpen, closeModel } = useModelInfo();

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

  return (
    <>
      <InfoModel
        visible={isOpen}
        onClose={() => {
          closeModel();
        }}
      />
      <Navbar />
      <Billboard />

      <div
        ref={sectionRef}
        className={`pb-20 relative z-10 ${hasVisited ? "row-shown" : sectionInView ? "row-enter-active" : "row-enter"}`}
      >
        {/* Continue Watching */}
        {!isContinueLoading && continueWatching && continueWatching.length > 0 && (
          <ContinueWatchingRow
            data={continueWatching}
            onRemove={() => mutateContinue()}
          />
        )}

        {/* Trending Now */}
        {isLoading ? (
          <SkelletonWrapper title="Trending Now" />
        ) : (
          <MovieList title="Trending Now" data={movies} />
        )}

        {/* Favourites */}
        {isFavLoading ? (
          <SkelletonWrapper title="Favourites Movies" />
        ) : (
          <MovieList title="Favourites Movies" data={favMovies} />
        )}

        {/* Series */}
        {isSeriesLoading ? (
          <SkelletonWrapper title="Series" />
        ) : (
          <SeriesList title="Series" data={seriesList} />
        )}

        {/* Region Content */}
        {!isRegionsLoading && regions?.map((region: any) => (
          <React.Fragment key={region.id}>
            {region.movies && region.movies.length > 0 && (
              <MovieList title={`${region.region} Movies`} data={region.movies} />
            )}
            {region.series && region.series.length > 0 && (
              <SeriesList title={`${region.region} Series`} data={region.series} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Footer />
    </>
  );
}

export default function Home({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <HomeDashboard />;
}
