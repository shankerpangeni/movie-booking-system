"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function MovieDetailPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch movie details
                const movieRes = await axios.get(`/api/movies?id=${id}`);
                setMovie(movieRes.data.movie);

                // Fetch showtimes for this movie
                const showtimesRes = await axios.get(`/api/shows?movieId=${id}`);
                setShowtimes(showtimesRes.data.showTimes || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <Loading message="Loading Movie Details..." />;
    if (!movie) return <div className="text-center mt-10">Movie not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Movie Poster */}
                <div className="w-full md:w-1/3 relative h-[500px]">
                    <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="rounded-lg shadow-lg object-cover"
                        priority
                    />
                </div>

                {/* Movie Info */}
                <div className="w-full md:w-2/3">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">{movie.title}</h1>
                    <p className="text-gray-300 mb-6 text-lg">{movie.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-gray-400">
                        <div>
                            <span className="font-bold text-white">Duration:</span> {movie.duration} mins
                        </div>
                        <div>
                            <span className="font-bold text-white">Rating:</span> {movie.rating}/10
                        </div>
                        <div>
                            <span className="font-bold text-white">Release Date:</span>{" "}
                            {new Date(movie.releaseDate).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-bold text-white">Genre:</span> {movie.genre.join(", ")}
                        </div>
                    </div>

                    {/* Showtimes */}
                    <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Available Shows</h2>
                    {showtimes.length === 0 ? (
                        <p className="text-gray-500">No shows scheduled yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {showtimes.map((show) => (
                                <Link
                                    key={show._id}
                                    href={`/book/${show._id}`}
                                    className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition border border-gray-700 hover:border-red-500 group"
                                >
                                    <div className="font-bold text-lg text-red-400 group-hover:text-red-300">
                                        {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(show.startTime).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-300 mt-2">
                                        {show.hall.name} - {show.screen.name}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
