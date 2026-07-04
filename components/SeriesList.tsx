"use client";

import React from "react";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import SeriesCard from "./SeriesCard";

interface SeriesListProps {
  data: Record<string, any>[];
  title: string;
}

const SeriesList: React.FC<SeriesListProps> = ({ data, title }) => {
  const router = useRouter();
  if (isEmpty(data)) return null;

  return (
    <div className="px-6 md:px-16 mt-8">
      <h2 className="text-white text-2xl md:text-3xl font-bold mb-5">{title}</h2>

      {/* Horizontal poster row */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
        {data.map((series) => (
          <div
            key={series.id}
            onClick={() => router.push(`/series/${series.id}`)}
            className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px]"
          >
            <SeriesCard data={series} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeriesList;
