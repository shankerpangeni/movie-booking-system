"use client";

import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { FaUserCircle, FaSignOutAlt, FaTicketAlt, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
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
                      <Image src={user.profileImage} alt="Profile" width={32} height={32} className="rounded-full object-cover border-2 border-transparent group-hover:border-red-500 transition" />
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white text-2xl p-2 hover:text-red-500 transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          {/* Mobile Navigation Links */}
          <Link
            href="/"
            className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition font-medium"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            href="/movies"
            className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition font-medium"
            onClick={closeMobileMenu}
          >
            Movies
          </Link>

          {isAuthenticated ? (
            <>
              {/* User Profile Section */}
              <div className="border-t border-gray-800 pt-3 mt-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition"
                  onClick={closeMobileMenu}
                >
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl" />
                  )}
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">View Profile</p>
                  </div>
                </Link>
              </div>

              {/* Admin Dashboard Link */}
              {user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="block text-red-400 hover:text-red-300 hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition"
                  onClick={closeMobileMenu}
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 px-4 py-3 rounded-lg transition font-medium"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login/Register for non-authenticated users */}
              <div className="border-t border-gray-800 pt-3 mt-3 space-y-3">
                <Link
                  href="/login"
                  className="block text-center text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
