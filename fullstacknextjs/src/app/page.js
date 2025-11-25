"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("/api/movies");
        setMovies(res.data.movies);
      } catch (error) {
        console.error("Failed to fetch movies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
  };

  if (loading) return <Loading message="Loading Movies..." />;

  const featuredMovie = movies[currentSlide];

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section - Using fixed pixel heights with breakpoints */}
      {featuredMovie && (
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full mb-6 sm:mb-8 md:mb-12 overflow-hidden">
          {/* Slides Container */}
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {movies.map((movie, index) => (
              <div key={movie._id} className="min-w-full h-full relative">
                <div className="absolute inset-0">
                  {movie.coverImage || movie.poster ? (
                    <Image
                      src={movie.coverImage || movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover opacity-90"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 opacity-50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 lg:p-16 w-full lg:w-2/3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
                    {movie.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 mb-3 sm:mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 drop-shadow-md">
                    {movie.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                    <Link
                      href={`/movie/${movie._id}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-2.5 lg:px-8 lg:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition transform hover:scale-105 text-center"
                    >
                      Book Now
                    </Link>
                    <button className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-2.5 lg:px-8 lg:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition backdrop-blur-sm border border-gray-600">
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full backdrop-blur-sm transition z-10"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full backdrop-blur-sm transition z-10"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${index === currentSlide ? "bg-red-600 w-6 sm:w-8" : "bg-white/50 w-1.5 sm:w-2"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white border-l-4 border-red-500 pl-3 sm:pl-4">
          Now Showing
        </h2>

        {movies.length === 0 ? (
          <p className="text-gray-500 text-center">No movies available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {movies.map((movie) => (
              <Link
                key={movie._id}
                href={`/movie/${movie._id}`}
                className="block group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 duration-300"
              >
                {/* Fixed responsive card height using breakpoints */}
                <div className="relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] w-full bg-gray-700">
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 p-4 text-center">
                      <span className="text-base sm:text-lg font-semibold">{movie.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base transform scale-50 group-hover:scale-100 transition-all duration-300">
                      Get Tickets
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{movie.title}</h3>
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-400">
                    <span>{movie.duration} mins</span>
                    <span className="flex items-center text-yellow-500">
                      ★ {movie.rating}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 uppercase tracking-wider">
                    {movie.genre?.join(", ")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
