import MovieSkeleton from "./MovieSkeleton";

const SkelletonWrapper = ({ title }: { title?: string }) => {
  return (
    <div className="space-y-4 px-6 md:px-16 mt-8">
      <p className="text-white text-2xl md:text-3xl font-bold mb-5">
        {title}
      </p>
      <div className="flex flex-row items-center gap-5 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MovieSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default SkelletonWrapper;