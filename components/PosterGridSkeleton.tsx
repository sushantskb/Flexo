import React from "react";

const PosterGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-5 gap-y-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-2xl bg-neutral-800 ring-1 ring-white/5" />
        <div className="h-4 w-3/4 mt-3 rounded bg-neutral-800" />
        <div className="h-3 w-1/2 mt-2 rounded bg-neutral-800/70" />
      </div>
    ))}
  </div>
);

export default PosterGridSkeleton;
