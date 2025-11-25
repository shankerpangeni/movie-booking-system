import { NextRequest } from "next/server";
import {
  createMovie,
  getMovies,
  getMovie,
  updateMovie,
  deleteMovie,
} from "@/controllers/movie.controller.js";
import { connectDB } from "@/lib/connectDb";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) return getMovie(req, id);
  return getMovies();
}

export async function POST(req) {
  await connectDB();
  return createMovie(req);
}

export async function PUT(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  return updateMovie(req, id);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  return deleteMovie(req, id);
}
