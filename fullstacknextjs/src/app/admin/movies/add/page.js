"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

export default function AddMoviePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        releaseDate: "",
        genre: "",
        rating: "",
    });
    const [files, setFiles] = useState({
        poster: null,
        coverImage: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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

            await axios.post("/api/movies", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Movie created successfully!");
            router.push("/admin/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create movie");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-red-500">Add New Movie</h1>
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
                        <input
                            type="file"
                            name="poster"
                            onChange={handleFileChange}
                            className="w-full text-gray-300"
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Cover Image</label>
                        <input
                            type="file"
                            name="coverImage"
                            onChange={handleFileChange}
                            className="w-full text-gray-300"
                            accept="image/*"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Movie"}
                </button>
            </form>
        </div>
    );
}
