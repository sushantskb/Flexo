"use client";

import React from "react";
import { isEmpty } from "lodash";
import MovieCard from "./MovieCard";
import { useRouter } from "next/router";

interface MovieListProps {
  data: Record<string, any>[];
  title: string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
  if (isEmpty(data)) return null;
  const router = useRouter();

  return (
    <div className="px-6 md:px-16 mt-8">
      <h2 className="text-white text-2xl md:text-3xl font-bold mb-5">
        {title}
      </h2>

      {/* Horizontal poster row */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
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
