import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";
import { useRouter } from "next/router";
import useModelInfo from "@/hooks/useModelInfo";
import useCurrentUser from "@/hooks/useCurrentUser";
import useCurrentProfile from "@/hooks/useGetProfile";
import useFavourites from "@/hooks/useFavourites";
import { useSelectionStore } from "@/zustand/useSelectStore";
import axios from "axios";

interface MoviePosterCardProps {
  data: Record<string, any>;
}

const isNewlyAdded = (dateStr?: string) => {
  if (!dateStr) return false;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= 7;
};

const MoviePosterCard: React.FC<MoviePosterCardProps> = ({ data }) => {
  const router = useRouter();
  const { openModel } = useModelInfo();
  const { profile } = useSelectionStore();
  const profileId = profile?.id;

  const { data: currentUser, mutate: mutateUser } = useCurrentUser();
  const { data: currentProfile, mutate: mutateProfile } = useCurrentProfile(
    profileId ? { profileId } : { profileId: undefined }
  );
  const { mutate: mutateFavourite } = useFavourites({ profileId });

  const isProfileMode = !!profileId;
  const favIds = isProfileMode
    ? currentProfile?.favouriteIds || []
    : currentUser?.favouriteIds || [];
  const isFavourite = data?.id ? favIds.includes(data.id) : false;

  const year = data?.createdAt ? new Date(data.createdAt).getFullYear() : null;

  const toggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data?.id) return;

    const url = isProfileMode
      ? `/api/favourite?email=${currentUser?.email}&isProfile=true&profileId=${profileId}`
      : `/api/favourite?email=${currentUser?.email}`;

    try {
      const response = isFavourite
        ? await axios.delete(url, { data: { movieId: data.id } })
        : await axios.post(url, { movieId: data.id });

      const updatedFavouriteIds = response?.data?.favouriteIds;
      if (isProfileMode) {
        mutateProfile({ ...currentProfile, favouriteIds: updatedFavouriteIds }, false);
      } else {
        mutateUser({ ...currentUser, favouriteIds: updatedFavouriteIds }, false);
      }
      mutateFavourite();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="group cursor-pointer" onClick={() => router.push(`/watch/${data?.id}`)}>
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-fuchsia-500/40 transition duration-300">
        {isNewlyAdded(data.createdAt) && (
          <span className="absolute top-3 right-3 z-20 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-lg shadow-fuchsia-500/30">
            New
          </span>
        )}

        <img
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          src={data.thumbnailUrl}
          alt={data.title || "Thumbnail"}
        />

        {/* Hover overlay with centered actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/watch/${data?.id}`);
            }}
            className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-lg hover:scale-105 transition"
            aria-label="Play"
          >
            <BsFillPlayFill size={26} className="text-black ml-0.5" />
          </button>

          <button
            onClick={toggleFavourite}
            className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex justify-center items-center hover:bg-white/30 transition"
            aria-label={isFavourite ? "Remove from list" : "Add to list"}
          >
            {isFavourite ? (
              <AiOutlineCheck size={20} className="text-white" />
            ) : (
              <AiOutlinePlus size={20} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Meta below poster */}
      <div className="mt-3 px-0.5">
        <p className="text-white text-base font-bold line-clamp-1 group-hover:text-fuchsia-400 transition">
          {data.title}
        </p>
        <p className="text-neutral-400 text-sm mt-1 line-clamp-1">
          {year && <span className="text-neutral-300">{year}</span>}
          {year && data.genre && <span className="mx-1.5 text-neutral-600">•</span>}
          {data.genre}
        </p>
      </div>
    </div>
  );
};

export default MoviePosterCard;
