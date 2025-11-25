"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== "admin")) {
            router.push("/");
        }
    }, [isAuthenticated, user, loading, router]);

    if (loading) return <Loading message="Loading Dashboard..." />;

    const sections = [
        {
            title: "Movies",
            description: "Add, edit, or remove movies from the system.",
            icon: "🎬",
            links: [
                { label: "View All Movies", href: "/admin/movies", color: "bg-blue-600 hover:bg-blue-700" },
                { label: "Add New Movie", href: "/admin/movies/add", color: "bg-green-600 hover:bg-green-700" },
            ],
        },
        {
            title: "Halls",
            description: "Manage cinema halls and their locations.",
            icon: "🏛️",
            links: [
                { label: "Manage Halls", href: "/admin/halls", color: "bg-purple-600 hover:bg-purple-700" },
            ],
        },
        {
            title: "Screens",
            description: "Configure screens and seat layouts for each hall.",
            icon: "💺",
            links: [
                { label: "Manage Screens", href: "/admin/screens", color: "bg-indigo-600 hover:bg-indigo-700" },
            ],
        },
        {
            title: "Showtimes",
            description: "Schedule movie showtimes across halls and screens.",
            icon: "🕐",
            links: [
                { label: "Manage Showtimes", href: "/admin/showtimes", color: "bg-orange-600 hover:bg-orange-700" },
            ],
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-red-500 mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">Manage your movie booking system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                        <div className="flex items-center mb-4">
                            <span className="text-4xl mr-4">{section.icon}</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                                <p className="text-gray-400 text-sm">{section.description}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {section.links.map((link, linkIndex) => (
                                <Link
                                    key={linkIndex}
                                    href={link.href}
                                    className={`${link.color} px-4 py-2 rounded text-white font-semibold transition flex-1 text-center`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 p-4 rounded text-center">
                        <div className="text-3xl font-bold text-red-500">🎬</div>
                        <div className="text-gray-400 text-sm mt-2">Movies</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded text-center">
                        <div className="text-3xl font-bold text-purple-500">🏛️</div>
                        <div className="text-gray-400 text-sm mt-2">Halls</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded text-center">
                        <div className="text-3xl font-bold text-indigo-500">💺</div>
                        <div className="text-gray-400 text-sm mt-2">Screens</div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded text-center">
                        <div className="text-3xl font-bold text-orange-500">🕐</div>
                        <div className="text-gray-400 text-sm mt-2">Showtimes</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
