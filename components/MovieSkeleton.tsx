const MovieSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] aspect-[2/3] animate-pulse rounded-2xl bg-neutral-800 ring-1 ring-white/5">
      <div className="w-full h-full rounded-2xl bg-gradient-to-t from-neutral-900/60 to-transparent" />
    </div>
  );
};
export default MovieSkeleton;
