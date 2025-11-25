"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function AdminScreensPage() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const [screens, setScreens] = useState([]);
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        hall: "",
    });
    const [editingId, setEditingId] = useState(null);

    // Seat layout builder state
    const [rows, setRows] = useState(5);
    const [seatsPerRow, setSeatsPerRow] = useState(10);
    const [seatLayout, setSeatLayout] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchData();
    }, [isAuthenticated, user, router]);

    const fetchData = async () => {
        try {
            const [screensRes, hallsRes] = await Promise.all([
                axios.get("/api/screens"),
                axios.get("/api/halls"),
            ]);
            setScreens(screensRes.data.screens || []);
            setHalls(hallsRes.data.halls || []);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const generateSeats = () => {
        const seats = [];
        const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let i = 0; i < rows; i++) {
            for (let j = 1; j <= seatsPerRow; j++) {
                seats.push({
                    seatName: `${rowLabels[i]}${j}`,
                    type: "regular",
                    price: 10,
                });
            }
        }
        setSeatLayout(seats);
        toast.success(`Generated ${seats.length} seats`);
    };

    const updateSeatPrice = (seatName, price) => {
        setSeatLayout(seatLayout.map(seat =>
            seat.seatName === seatName ? { ...seat, price: Number(price) } : seat
        ));
    };

    const updateSeatType = (seatName, type) => {
        const priceMap = { regular: 10, premium: 15, vip: 20 };
        setSeatLayout(seatLayout.map(seat =>
            seat.seatName === seatName
                ? { ...seat, type, price: priceMap[type] }
                : seat
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (seatLayout.length === 0) {
            toast.error("Please generate seat layout first");
            return;
        }

        try {
            const data = {
                ...formData,
                layout: seatLayout,
            };

            if (editingId) {
                await axios.put(`/api/screens?id=${editingId}`, data);
                toast.success("Screen updated successfully");
            } else {
                await axios.post("/api/screens", data);
                toast.success("Screen created successfully");
            }

            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const resetForm = () => {
        setFormData({ name: "", hall: "" });
        setSeatLayout([]);
        setRows(5);
        setSeatsPerRow(10);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (screen) => {
        setFormData({
            name: screen.name,
            hall: screen.hall._id,
        });
        setSeatLayout(screen.layout);
        setEditingId(screen._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this screen?")) return;
        try {
            await axios.delete(`/api/screens?id=${id}`);
            toast.success("Screen deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete screen");
        }
    };

    if (loading) return <Loading message="Loading Screens..." />;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-red-500">Manage Screens</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition"
                >
                    {showForm ? "Cancel" : "+ Add Screen"}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? "Edit Screen" : "Add New Screen"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-2">Screen Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Hall</label>
                                <select
                                    value={formData.hall}
                                    onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                                    className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Select Hall</option>
                                    {halls.map(hall => (
                                        <option key={hall._id} value={hall._id}>{hall.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-bold mb-4">Seat Layout Builder</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">Rows</label>
                                    <input
                                        type="number"
                                        value={rows}
                                        onChange={(e) => setRows(Number(e.target.value))}
                                        min="1"
                                        max="26"
                                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Seats per Row</label>
                                    <input
                                        type="number"
                                        value={seatsPerRow}
                                        onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                                        min="1"
                                        max="50"
                                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={generateSeats}
                                        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded text-white font-bold transition"
                                    >
                                        Generate Layout
                                    </button>
                                </div>
                            </div>

                            {seatLayout.length > 0 && (
                                <div className="bg-gray-900 p-4 rounded max-h-96 overflow-auto">
                                    <p className="text-sm text-gray-400 mb-4">
                                        Total Seats: {seatLayout.length} | Click seats to change type/price
                                    </p>
                                    <div className="grid grid-cols-10 gap-2">
                                        {seatLayout.map((seat) => (
                                            <div key={seat.seatName} className="text-center">
                                                <select
                                                    value={seat.type}
                                                    onChange={(e) => updateSeatType(seat.seatName, e.target.value)}
                                                    className={`w-full text-xs p-1 rounded ${seat.type === "vip" ? "bg-yellow-600" :
                                                        seat.type === "premium" ? "bg-purple-600" :
                                                            "bg-gray-600"
                                                        }`}
                                                >
                                                    <option value="regular">R</option>
                                                    <option value="premium">P</option>
                                                    <option value="vip">V</option>
                                                </select>
                                                <div className="text-xs text-gray-400 mt-1">{seat.seatName}</div>
                                                <input
                                                    type="number"
                                                    value={seat.price}
                                                    onChange={(e) => updateSeatPrice(seat.seatName, e.target.value)}
                                                    className="w-full text-xs p-1 rounded bg-gray-700 text-white mt-1"
                                                    min="1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition"
                        >
                            {editingId ? "Update Screen" : "Create Screen"}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screens.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center">No screens found. Create one to get started.</p>
                ) : (
                    screens.map((screen) => (
                        <div key={screen._id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <h3 className="text-xl font-bold text-white mb-2">{screen.name}</h3>
                            <p className="text-gray-400 text-sm mb-1">🏛️ {screen.hall?.name || "N/A"}</p>
                            <p className="text-gray-500 text-sm mb-4">💺 {screen.layout?.length || 0} seats</p>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(screen)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(screen._id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
