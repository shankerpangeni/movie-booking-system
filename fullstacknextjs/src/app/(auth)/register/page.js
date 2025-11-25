"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (isAuthenticated) {
            router.push("/");
        }
    }, [error, isAuthenticated, dispatch, router]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register(formData));
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-red-500">Register</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2">Name</label>
                    <input
                        type="text"
                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <p className="mt-4 text-center text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-red-400 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
}
