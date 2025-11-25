import Movie from "@/models/movie.models";
import mongoose from "mongoose";
import { cloudinaryUploader, toNodeReq, runMiddleware } from "@/lib/upload.js";

// ---------------- CREATE MOVIE ----------------
export async function createMovie(req) {
  try {
    // Generate a new ID for the movie to use in folder path
    const movieId = new mongoose.Types.ObjectId();

    // Convert Next.js Request to Node.js-like request for Multer
    const nodeReq = toNodeReq(req);
    const nodeRes = {
      setHeader: () => { },
      getHeader: () => { },
      end: () => { },
    };

    // Multer fields setup with generated ID
    const upload = cloudinaryUploader("movies", movieId.toString()).fields([
      { name: "poster", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
      { name: "castImages", maxCount: 10 }, // optional
    ]);

    // Run Multer middleware
    await runMiddleware(nodeReq, nodeRes, upload);

    // Extract text fields from nodeReq.body (populated by Multer)
    const { title, description, duration, releaseDate, genre, rating, cast } = nodeReq.body;

    if (!title || !duration) {
      return new Response(
        JSON.stringify({ success: false, message: "Title and duration are required" }),
        { status: 400 }
      );
    }

    // Prepare images from nodeReq.files
    const poster = nodeReq.files?.poster?.[0]?.path || "";
    const coverImage = nodeReq.files?.coverImage?.[0]?.path || "";

    // Prepare cast array with optional images
    let castWithImages = [];
    if (cast) {
      const castArray = typeof cast === "string" ? JSON.parse(cast) : cast;
      castWithImages = castArray.map((c, idx) => ({
        ...c,
        image: nodeReq.files?.castImages?.[idx]?.path || c.image || "",
      }));
    }

    // Create movie in DB with the pre-generated ID
    const movie = await Movie.create({
      _id: movieId,
      title,
      description,
      duration: Number(duration),
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      genre: genre ? JSON.parse(genre) : [],
      rating: rating ? Number(rating) : undefined,
      poster,
      coverImage,
      cast: castWithImages,
    });

    return new Response(JSON.stringify({ success: true, movie }), { status: 201 });
  } catch (err) {
    console.error("CREATE MOVIE ERROR:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

// ---------------- GET ALL MOVIES ----------------
export async function getMovies() {
  try {
    const movies = await Movie.find();
    return new Response(JSON.stringify({ success: true, movies }), { status: 200 });
  } catch (err) {
    console.error("GET MOVIES ERROR:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

// ---------------- GET SINGLE MOVIE ----------------
export async function getMovie(req, id) {
  try {
    if (!id) return new Response(JSON.stringify({ success: false, message: "ID required" }), { status: 400 });

    const movie = await Movie.findById(id);
    if (!movie)
      return new Response(JSON.stringify({ success: false, message: "Movie not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, movie }), { status: 200 });
  } catch (err) {
    console.error("GET MOVIE ERROR:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

// ---------------- UPDATE MOVIE ----------------
export async function updateMovie(req, id) {
  try {
    if (!id) return new Response(JSON.stringify({ success: false, message: "ID required" }), { status: 400 });

    // Convert Next.js Request to Node.js-like request
    const nodeReq = toNodeReq(req);
    const nodeRes = {
      setHeader: () => { },
      getHeader: () => { },
      end: () => { },
    };

    // Upload new files if provided, using existing ID
    const upload = cloudinaryUploader("movies", id).fields([
      { name: "poster", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
      { name: "castImages", maxCount: 10 },
    ]);

    await runMiddleware(nodeReq, nodeRes, upload);

    const updateData = { ...nodeReq.body };

    if (updateData.genre) {
      try {
        updateData.genre = JSON.parse(updateData.genre);
      } catch (e) {
        // If it's not a JSON string, assume it's already in correct format or leave it
        console.error("Error parsing genre:", e);
      }
    }
    if (updateData.duration) updateData.duration = Number(updateData.duration);
    if (updateData.rating) updateData.rating = Number(updateData.rating);

    if (nodeReq.files?.poster?.[0]?.path) updateData.poster = nodeReq.files.poster[0].path;
    if (nodeReq.files?.coverImage?.[0]?.path) updateData.coverImage = nodeReq.files.coverImage[0].path;

    if (nodeReq.body.cast) {
      const castArray = typeof nodeReq.body.cast === "string" ? JSON.parse(nodeReq.body.cast) : nodeReq.body.cast;
      updateData.cast = castArray.map((c, idx) => ({
        ...c,
        image: nodeReq.files?.castImages?.[idx]?.path || c.image || "",
      }));
    }

    const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
    if (!movie)
      return new Response(JSON.stringify({ success: false, message: "Movie not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, movie }), { status: 200 });
  } catch (err) {
    console.error("UPDATE MOVIE ERROR:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

// ---------------- DELETE MOVIE ----------------
export async function deleteMovie(req, id) {
  try {
    if (!id) return new Response(JSON.stringify({ success: false, message: "ID required" }), { status: 400 });

    const movie = await Movie.findByIdAndDelete(id);
    if (!movie)
      return new Response(JSON.stringify({ success: false, message: "Movie not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, message: "Movie deleted" }), { status: 200 });
  } catch (err) {
    console.error("DELETE MOVIE ERROR:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
