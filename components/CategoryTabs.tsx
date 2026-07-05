import React from "react";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  active,
  onChange,
}) => {
  return (
    <div className="relative mb-10">
      <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-black to-transparent z-10" />

      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-2 px-1">
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              onClick={() => onChange(category)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30 scale-105"
                  : "bg-white/[0.04] text-neutral-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white hover:ring-white/20"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
