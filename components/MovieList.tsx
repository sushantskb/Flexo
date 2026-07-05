"use client";

import React from "react";
import { isEmpty } from "lodash";
import MovieCard from "./MovieCard";
import { useRouter } from "next/router";
import { useInView } from "@/hooks/useInView";

interface MovieListProps {
  data: Record<string, any>[];
  title: string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
  if (isEmpty(data)) return null;
  const router = useRouter();
  const [ref, isInView, hasVisited] = useInView({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  return (
    <div
      ref={ref}
      className={`px-6 md:px-16 mt-8 ${hasVisited ? "row-shown" : isInView ? "row-enter-active" : "row-enter"}`}
    >
      <h2 className="section-title text-white text-2xl md:text-3xl font-bold mb-5">
        {title}
      </h2>

      {/* Horizontal poster row */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide smooth-scroll pb-2">
        {data.map((movie) => (
          <div
            key={movie.id}
            onClick={() => router.push(`/watch/${movie.id}`)}
            className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px]"
          >
            <MovieCard data={movie} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
