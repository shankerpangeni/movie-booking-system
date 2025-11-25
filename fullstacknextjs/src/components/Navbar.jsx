"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { FaUserCircle, FaSignOutAlt, FaTicketAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <FaTicketAlt className="text-red-600 text-2xl" />
            <span className="text-2xl font-bold text-white tracking-wider">
              CINE<span className="text-red-600">BOOK</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition font-medium">
              Home
            </Link>
            <Link href="/movies" className="text-gray-300 hover:text-white transition font-medium">
              Movies
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="text-red-400 hover:text-red-300 font-medium transition"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition group">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-red-500 transition" />
                    ) : (
                      <FaUserCircle className="text-2xl" />
                    )}
                    <span className="font-medium">{user?.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Logout"
                  >
                    <FaSignOutAlt className="text-xl" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition transform hover:scale-105 shadow-lg hover:shadow-red-600/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
