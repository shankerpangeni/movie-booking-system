"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function AdminMoviesPage() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchMovies();
    }, [isAuthenticated, user, router]);

    const fetchMovies = async () => {
        try {
            const res = await axios.get("/api/movies");
            setMovies(res.data.movies || []);
        } catch (error) {
            toast.error("Failed to fetch movies");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this movie?")) return;
        try {
            await axios.delete(`/api/movies?id=${id}`);
            toast.success("Movie deleted successfully");
            fetchMovies();
        } catch (error) {
            toast.error("Failed to delete movie");
        }
    };

    const handleStatusToggle = async (movieId, currentStatus) => {
        setUpdatingStatus(movieId);
        try {
            const newStatus = currentStatus === "now-showing" ? "upcoming" : "now-showing";

            // Create FormData for the update
            const formData = new FormData();
            formData.append("status", newStatus);

            await axios.put(`/api/movies?id=${movieId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(`Movie moved to ${newStatus === "now-showing" ? "Now Showing" : "Upcoming"}`);
            fetchMovies();
        } catch (error) {
            toast.error("Failed to update movie status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (loading) return <Loading message="Loading Movies..." />;

    // Separate movies by status
    const nowShowingMovies = movies.filter((m) => m.status === "now-showing" || !m.status);
    const upcomingMovies = movies.filter((m) => m.status === "upcoming");

    const MovieTable = ({ movies, title, emptyMessage }) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-red-500 pl-4">
                {title}
            </h2>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Poster</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Genre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {movies.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            movies.map((movie) => (
                                <tr key={movie._id} className="hover:bg-gray-700 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="relative w-16 h-24">
                                            <Image
                                                src={movie.poster}
                                                alt={movie.title}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">{movie.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {movie.genre?.join(", ") || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{movie.duration} mins</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-yellow-500">★ {movie.rating}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(movie._id, movie.status || "now-showing")}
                                            disabled={updatingStatus === movie._id}
                                            className={`px-3 py-1 rounded text-xs font-semibold transition ${movie.status === "upcoming"
                                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                                } ${updatingStatus === movie._id ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            {updatingStatus === movie._id
                                                ? "Updating..."
                                                : movie.status === "upcoming"
                                                    ? "Upcoming"
                                                    : "Now Showing"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/movie/${movie._id}`}
                                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm transition"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/admin/movies/edit/${movie._id}`}
                                                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white text-sm transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(movie._id)}
                                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-red-500">Manage Movies</h1>
                <Link
                    href="/admin/movies/add"
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition"
                >
                    + Add Movie
                </Link>
            </div>

            <MovieTable
                movies={nowShowingMovies}
                title="Now Showing"
                emptyMessage="No movies currently showing. Add one or move from upcoming."
            />

            <MovieTable
                movies={upcomingMovies}
                title="Upcoming Movies"
                emptyMessage="No upcoming movies. Add one or move from now showing."
            />
        </div>
    );
}
