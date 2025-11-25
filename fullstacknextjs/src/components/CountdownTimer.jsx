"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

export default function CountdownTimer({ expiresAt, onExpire }) {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Memoize onExpire to prevent unnecessary re-renders
    const handleExpire = useCallback(() => {
        if (onExpire) onExpire();
    }, [onExpire]);

    // Calculate time left based on current time (no setState in effect!)
    const timeLeft = useMemo(() => {
        if (!expiresAt) return 0;
        const expiry = new Date(expiresAt).getTime();
        const difference = expiry - currentTime;
        return Math.max(0, Math.floor(difference / 1000)); // seconds
    }, [expiresAt, currentTime]);

    useEffect(() => {
        if (!expiresAt) return;

        // Check if already expired
        if (timeLeft <= 0) {
            handleExpire();
            return;
        }

        // Update current time every second
        const interval = setInterval(() => {
            const now = Date.now();
            setCurrentTime(now);

            // Check expiry
            const expiry = new Date(expiresAt).getTime();
            if (now >= expiry) {
                clearInterval(interval);
                handleExpire();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, handleExpire, timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isWarning = timeLeft > 0 && timeLeft <= 120; // Less than 2 minutes
    const isExpired = timeLeft === 0;

    return (
        <div
            className={`text-center py-3 px-6 rounded-lg font-bold text-lg transition-all ${isExpired
                ? "bg-red-900 text-white"
                : isWarning
                    ? "bg-yellow-600 text-white animate-pulse"
                    : "bg-gray-800 text-white"
                }`}
        >
            {isExpired ? (
                <span>⏰ Time Expired - Seats Released</span>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    <span>⏱️ Time Remaining:</span>
                    <span className="font-mono text-2xl">
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                </div>
            )}
        </div>
    );
}
