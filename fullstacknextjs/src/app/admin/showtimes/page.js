"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function AdminShowtimesPage() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        movie: "",
        hall: "",
        screen: "",
        startTime: "",
        endTime: "",
    });

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchData();
    }, [isAuthenticated, user, router]);

    const fetchData = async () => {
        try {
            const [showtimesRes, moviesRes, hallsRes, screensRes] = await Promise.all([
                axios.get("/api/shows"),
                axios.get("/api/movies"),
                axios.get("/api/halls"),
                axios.get("/api/screens"),
            ]);
            setShowtimes(showtimesRes.data.showTimes || []);
            setMovies(moviesRes.data.movies || []);
            setHalls(hallsRes.data.halls || []);
            setScreens(screensRes.data.screens || []);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleHallChange = (hallId) => {
        setFormData({ ...formData, hall: hallId, screen: "" });
    };

    const getScreensForHall = () => {
        return screens.filter(screen => screen.hall?._id === formData.hall);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/shows", formData);
            toast.success("Showtime created successfully");
            setFormData({
                movie: "",
                hall: "",
                screen: "",
                startTime: "",
                endTime: "",
            });
            setShowForm(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create showtime");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this showtime?")) return;
        try {
            await axios.delete(`/api/shows?id=${id}`);
            toast.success("Showtime deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete showtime");
        }
    };

    if (loading) return <Loading message="Loading Showtimes..." />;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-red-500">Manage Showtimes</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition"
                >
                    {showForm ? "Cancel" : "+ Schedule Showtime"}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Schedule New Showtime</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Movie</label>
                            <select
                                value={formData.movie}
                                onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Select Movie</option>
                                {movies.map(movie => (
                                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Hall</label>
                                <select
                                    value={formData.hall}
                                    onChange={(e) => handleHallChange(e.target.value)}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Select Hall</option>
                                    {halls.map(hall => (
                                        <option key={hall._id} value={hall._id}>{hall.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Screen</label>
                                <select
                                    value={formData.screen}
                                    onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                    disabled={!formData.hall}
                                >
                                    <option value="">Select Screen</option>
                                    {getScreensForHall().map(screen => (
                                        <option key={screen._id} value={screen._id}>{screen.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition"
                        >
                            Schedule Showtime
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Movie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hall</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Screen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">End Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {showtimes.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No showtimes scheduled. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            showtimes.map((show) => (
                                <tr key={show._id} className="hover:bg-gray-700 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-white">{show.movie?.title || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{show.hall?.name || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{show.screen?.name || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {new Date(show.startTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                        {new Date(show.endTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDelete(show._id)}
                                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
