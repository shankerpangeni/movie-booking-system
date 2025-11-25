"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function EditMoviePage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        releaseDate: "",
        genre: "",
        rating: "",
    });
    const [currentImages, setCurrentImages] = useState({
        poster: "",
        coverImage: "",
    });
    const [files, setFiles] = useState({
        poster: null,
        coverImage: null,
    });

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await axios.get(`/api/movies?id=${id}`);
                const movie = res.data.movie;

                setFormData({
                    title: movie.title,
                    description: movie.description,
                    duration: movie.duration,
                    releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : "",
                    genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre,
                    rating: movie.rating,
                });
                setCurrentImages({
                    poster: movie.poster,
                    coverImage: movie.coverImage,
                });
            } catch (error) {
                toast.error("Failed to fetch movie details");
                router.push("/admin/movies");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMovie();
        }
    }, [id, router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("duration", formData.duration);
            data.append("releaseDate", formData.releaseDate);
            data.append("genre", JSON.stringify(formData.genre.split(",").map((g) => g.trim())));
            data.append("rating", formData.rating);

            if (files.poster) data.append("poster", files.poster);
            if (files.coverImage) data.append("coverImage", files.coverImage);

            await axios.put(`/api/movies?id=${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Movie updated successfully!");
            router.push("/admin/movies");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update movie");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading message="Loading Movie Details..." />;

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl my-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-red-500">Edit Movie</h1>
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white transition"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-gray-300 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="4"
                        required
                    />
                </div>

                {/* Duration & Rating */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Duration (mins)</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Rating (0-10)</label>
                        <input
                            type="number"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            step="0.1"
                            min="0"
                            max="10"
                        />
                    </div>
                </div>

                {/* Release Date & Genre */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Release Date</label>
                        <input
                            type="date"
                            name="releaseDate"
                            value={formData.releaseDate}
                            onChange={handleChange}
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Genre (comma separated)</label>
                        <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Action, Drama, Sci-Fi"
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Poster Image</label>
                        {currentImages.poster && (
                            <div className="mb-2 relative h-32 w-24">
                                <Image
                                    src={currentImages.poster}
                                    alt="Current Poster"
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            name="poster"
                            onChange={handleFileChange}
                            className="w-full text-gray-300 text-sm"
                            accept="image/*"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current</p>
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Cover Image</label>
                        {currentImages.coverImage && (
                            <div className="mb-2 relative h-32 w-full">
                                <Image
                                    src={currentImages.coverImage}
                                    alt="Current Cover"
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            name="coverImage"
                            onChange={handleFileChange}
                            className="w-full text-gray-300 text-sm"
                            accept="image/*"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
                >
                    {submitting ? "Updating..." : "Update Movie"}
                </button>
            </form>
        </div>
    );
}
