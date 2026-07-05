"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Navbar from "@/components/Navbar";
import InfoModel from "@/components/InfoModel";
import MoviePosterCard from "@/components/MoviePosterCard";
import SeriesPosterCard from "@/components/SeriesPosterCard";
import CategoryTabs from "@/components/CategoryTabs";
import PosterGridSkeleton from "@/components/PosterGridSkeleton";
import Footer from "@/components/Footer";
import NoData from "@/components/NoData";
import Loader from "@/components/Loader";
import useRegions from "@/hooks/useRegions";
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

const TABS = ["All", "Series", "Movies"];

const AnimeHero = ({ item }: { item: any }) => {
  const router = useRouter();
  if (!item) return null;

  const isSeries = item._type === "series";
  const goTo = () =>
    router.push(isSeries ? `/series/${item.id}` : `/watch/${item.id}`);

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
      <img
        src={item.thumbnailUrl || ""}
        alt={item.title || "Featured anime"}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

      <div className="absolute bottom-[10%] md:bottom-[14%] left-4 md:left-16 right-4 md:right-auto max-w-2xl">
        <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[11px] md:text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase shadow-lg shadow-fuchsia-500/20">
          Featured Anime
        </span>

        <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl uppercase leading-[0.95] mt-5">
          {item.title}
        </h1>

        {item.description && (
          <p className="hidden sm:block text-neutral-300 text-sm md:text-lg mt-5 max-w-xl leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={goTo}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold hover:opacity-90 transition shadow-lg shadow-fuchsia-500/30"
          >
            <BsFillPlayFill size={26} />
            {isSeries ? "Watch Now" : "Play"}
          </button>

          <button
            onClick={goTo}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 md:px-9 py-3.5 rounded-2xl text-base md:text-lg font-bold hover:bg-white/20 transition"
          >
            <AiOutlineInfoCircle size={20} />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AnimePage() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: regions = [], isLoading } = useRegions();
  const { isOpen, closeModel } = useModelInfo();

  // Find the "anime" region and split its content by type
  const { series, movies } = useMemo(() => {
    const animeRegion = Array.isArray(regions)
      ? regions.find((r: any) => r.region?.toLowerCase() === "anime")
      : null;

    const series = (animeRegion?.series || []).map((s: any) => ({
      ...s,
      _type: "series",
    }));
    const movies = (animeRegion?.movies || []).map((m: any) => ({
      ...m,
      _type: "movie",
    }));

    return { series, movies };
  }, [regions]);

  const items = useMemo(() => {
    if (activeTab === "Series") return series;
    if (activeTab === "Movies") return movies;
    return [...series, ...movies];
  }, [activeTab, series, movies]);

  const featured = series[0] || movies[0] || null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Loader />
      </>
    );
  }

  return (
    <>
      <InfoModel visible={isOpen} onClose={closeModel} />
      <Navbar />

      {featured ? (
        <AnimeHero item={featured} />
      ) : (
        <div className="h-24" />
      )}

      <div className="px-6 md:px-16 pt-10 pb-20">
        {/* Section heading */}
        <div className="mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            Anime
          </h1>
          <p className="text-neutral-400 text-sm mt-1.5">
            {`${items.length} title${items.length === 1 ? "" : "s"} available`}
          </p>
        </div>

        {/* Type tabs */}
        <CategoryTabs
          categories={TABS}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Grid */}
        {items.length === 0 ? (
          <NoData
            variant="anime"
            title="No anime found"
            description="We couldn't find any anime right now. Please check back later."
            actionLabel="View All"
            onAction={() => setActiveTab("All")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
            {items.map((item: any) =>
              item._type === "series" ? (
                <SeriesPosterCard key={`s-${item.id}`} data={item} />
              ) : (
                <MoviePosterCard key={`m-${item.id}`} data={item} />
              )
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
