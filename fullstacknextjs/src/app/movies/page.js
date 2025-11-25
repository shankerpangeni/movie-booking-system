"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function MoviesPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get("/api/movies");
                setMovies(res.data.movies);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) return <Loading message="Loading Movies..." />;

    // Separate movies by status
    const nowShowingMovies = movies.filter((m) => m.status === "now-showing" || !m.status);
    const upcomingMovies = movies.filter((m) => m.status === "upcoming");

    // Filter function
    const filterMovies = (movieList) => {
        return movieList.filter((movie) => {
            const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenre = selectedGenre === "all" || movie.genre?.includes(selectedGenre);
            return matchesSearch && matchesGenre;
        });
    };

    const filteredNowShowing = filterMovies(nowShowingMovies);
    const filteredUpcoming = filterMovies(upcomingMovies);

    // Get unique genres
    const genres = ["all", ...new Set(movies.flatMap((m) => m.genre || []))];

    // Movie Card Component
    const MovieCard = ({ movie }) => (
        <Link
            href={`/movie/${movie._id}`}
            className="block group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
        >
            <div className="relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] w-full bg-gray-700">
                {movie.poster ? (
                    <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 p-4 text-center">
                        <span className="text-base sm:text-lg font-semibold">{movie.title}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base transform scale-50 group-hover:scale-100 transition-all duration-300">
                        {movie.status === "upcoming" ? "Coming Soon" : "Get Tickets"}
                    </span>
                </div>
            </div>
            <div className="p-3 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">
                    {movie.title}
                </h3>
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400">
                    <span>{movie.duration} mins</span>
                    <span className="flex items-center text-yellow-500">★ {movie.rating}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 uppercase tracking-wider">
                    {movie.genre?.join(", ")}
                </div>
                {movie.releaseDate && movie.status === "upcoming" && (
                    <div className="mt-2 text-xs text-red-400 font-semibold">
                        Releases: {new Date(movie.releaseDate).toLocaleDateString()}
                    </div>
                )}
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">All Movies</h1>
                    <p className="text-red-100 text-lg">
                        Browse now showing and upcoming movies
                    </p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre === "all" ? "All Genres" : genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20">
                {/* Now Showing Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white border-l-4 border-red-500 pl-4">
                            Now Showing
                        </h2>
                        <span className="text-gray-400 text-sm">
                            {filteredNowShowing.length} {filteredNowShowing.length === 1 ? "movie" : "movies"}
                        </span>
                    </div>

                    {filteredNowShowing.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                            <p className="text-gray-500 text-lg">
                                {searchQuery || selectedGenre !== "all"
                                    ? "No movies found matching your criteria"
                                    : "No movies currently showing"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                            {filteredNowShowing.map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white border-l-4 border-blue-500 pl-4">
                            Coming Soon
                        </h2>
                        <span className="text-gray-400 text-sm">
                            {filteredUpcoming.length} {filteredUpcoming.length === 1 ? "movie" : "movies"}
                        </span>
                    </div>

                    {filteredUpcoming.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                            <p className="text-gray-500 text-lg">
                                {searchQuery || selectedGenre !== "all"
                                    ? "No upcoming movies found matching your criteria"
                                    : "No upcoming movies at this time"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                            {filteredUpcoming.map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
