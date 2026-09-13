import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { normalizeMovie, pickRelatedMovies } from "@/lib/movieDetails";

const OBJECT_ID = /^[a-f\d]{24}$/i;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    await serverAuth(req);
    // await serverAuth(req, res);

    const { movieId } = req.query;

    if (typeof movieId !== "string" || !OBJECT_ID.test(movieId)) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const movie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
      include: {
        region: true,
      },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const candidates = await prismadb.movie.findMany({
      where: { id: { not: movie.id } },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        posterUrl: true,
        genre: true,
        regionId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    // Raw fields are kept for existing consumers (e.g. InfoModel); normalized
    // fields override them with cleaned-up values and fill in safe defaults.
    return res.status(200).json({
      ...movie,
      ...normalizeMovie(movie, pickRelatedMovies(movie, candidates)),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
