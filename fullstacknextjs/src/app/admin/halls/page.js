"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function AdminHallsPage() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        description: "",
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchHalls();
    }, [isAuthenticated, user, router]);

    const fetchHalls = async () => {
        try {
            const res = await axios.get("/api/halls");
            setHalls(res.data.halls || []);
        } catch (error) {
            toast.error("Failed to fetch halls");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/halls?id=${editingId}`, formData);
                toast.success("Hall updated successfully");
            } else {
                await axios.post("/api/halls", formData);
                toast.success("Hall created successfully");
            }
            setFormData({ name: "", address: "", description: "" });
            setEditingId(null);
            setShowForm(false);
            fetchHalls();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleEdit = (hall) => {
        setFormData({
            name: hall.name,
            address: hall.address,
            description: hall.description || "",
        });
        setEditingId(hall._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this hall?")) return;
        try {
            await axios.delete(`/api/halls?id=${id}`);
            toast.success("Hall deleted successfully");
            fetchHalls();
        } catch (error) {
            toast.error("Failed to delete hall");
        }
    };

    if (loading) return <Loading message="Loading Halls..." />;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-red-500">Manage Halls</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ name: "", address: "", description: "" });
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition"
                >
                    {showForm ? "Cancel" : "+ Add Hall"}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? "Edit Hall" : "Add New Hall"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Hall Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition"
                        >
                            {editingId ? "Update Hall" : "Create Hall"}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {halls.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center">No halls found. Create one to get started.</p>
                ) : (
                    halls.map((hall) => (
                        <div key={hall._id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <h3 className="text-xl font-bold text-white mb-2">{hall.name}</h3>
                            <p className="text-gray-400 text-sm mb-1">📍 {hall.address}</p>
                            {hall.description && (
                                <p className="text-gray-500 text-sm mb-4">{hall.description}</p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(hall)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(hall._id)}
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
