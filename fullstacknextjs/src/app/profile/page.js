"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { loadUser } from "@/redux/slices/authSlice";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function ProfilePage() {
    const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get("/api/bookings");
                setBookings(res.data.bookings);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) fetchBookings();
    }, [isAuthenticated]);

    const handleImageUpload = async () => {
        if (!imageFile) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("profileImage", imageFile);

            await axios.put("/api/auth/me", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Profile image updated!");
            dispatch(loadUser());
            setImageFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || loading) return <Loading message="Loading Profile..." />;
    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Profile Header */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group w-32 h-32">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-red-500 bg-gray-700 relative">
                        {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <label className="cursor-pointer text-xs text-white text-center p-2 w-full h-full flex items-center justify-center">
                            Change Photo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="text-sm text-red-400 uppercase mt-1">{user.role}</p>

                    {imageFile && (
                        <div className="mt-4">
                            <span className="text-sm text-gray-300 mr-2">Selected: {imageFile.name}</span>
                            <button
                                onClick={handleImageUpload}
                                disabled={uploading}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm text-white"
                            >
                                {uploading ? "Uploading..." : "Save Photo"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookings History */}
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">My Bookings</h2>
            {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings found.</p>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-gray-800 p-6 rounded-lg shadow flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-24 h-36 flex-shrink-0 relative">
                                <Image
                                    src={booking.showtime.movie.poster}
                                    alt={booking.showtime.movie.title}
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-red-500 mb-2">{booking.showtime.movie.title}</h3>
                                <p className="text-gray-300 mb-1">
                                    {booking.showtime.hall.name} - {booking.showtime.screen.name}
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                    {new Date(booking.showtime.startTime).toLocaleString()}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.seats.map((seat) => (
                                        <span key={seat._id} className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-300">
                                            {seat.seatName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 mb-1">Total Price</div>
                                <div className="text-2xl font-bold text-white">
                                    ${booking.seats.reduce((sum, s) => sum + s.price, 0)}
                                </div>
                                <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-900 text-green-400 uppercase">
                                    {booking.paymentStatus}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
