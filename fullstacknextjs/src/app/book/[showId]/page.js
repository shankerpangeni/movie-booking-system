"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";
import CountdownTimer from "@/components/CountdownTimer";
import Loading from "@/components/Loading";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SeatSelectionPage() {
    const { showId } = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [showTime, setShowTime] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [reservedSeats, setReservedSeats] = useState([]); // Seats reserved by others
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [reservationExpiry, setReservationExpiry] = useState(null);
    const [reserving, setReserving] = useState(false); // Loading state for seat reservation
    const [clickedSeat, setClickedSeat] = useState(null); // Track which seat is being reserved

    // Use ref to always get the latest selectedSeats value
    const selectedSeatsRef = useRef(selectedSeats);

    useEffect(() => {
        selectedSeatsRef.current = selectedSeats;
    }, [selectedSeats]);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please login to book tickets");
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Get ShowTime details (includes Screen layout)
                const showRes = await axios.get(`/api/shows?id=${showId}`);
                setShowTime(showRes.data.showTime);

                // 2. Get Occupied Seats + Reserved Seats
                const bookingsRes = await axios.get(`/api/bookings?showtimeId=${showId}`);
                const { bookings, reservations } = bookingsRes.data;

                const occupied = bookings.flatMap(b => b.seats.map(s => s.seatName));
                setOccupiedSeats(occupied);

                // Reserved seats by OTHER users (show as YELLOW)
                const reserved = reservations
                    .filter(r => r.userId.toString() !== user?.id?.toString())
                    .flatMap(r => r.seats);
                setReservedSeats(reserved);

                // Check if current user has an active reservation
                const myReservation = reservations.find(r => r.userId.toString() === user?.id?.toString());
                if (myReservation) {
                    setReservationExpiry(myReservation.expiresAt);
                }
                // Note: We don't sync selectedSeats from backend during polling
                // This prevents interference with multi-seat selection
                // Seats are only cleared on timer expiry or manual release
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load show details");
            } finally {
                setLoading(false);
            }
        };

        if (showId) fetchData();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [showId, isAuthenticated, router, user]);

    // Reserve seats when user selects them
    const reserveSeats = useCallback(async (seats) => {
        if (seats.length === 0) return;

        try {
            const response = await axios.post("/api/seats/reserve", {
                showtimeId: showId,
                seats: seats.map(s => s.seatName),
            });

            setReservationExpiry(response.data.reservation.expiresAt);
        } catch (error) {
            console.error("Reservation error:", error);
            toast.error(error.response?.data?.error || "Failed to reserve seats");
            throw error; // Re-throw to handle in toggleSeat
        }
    }, [showId]);

    // Release seats on component unmount or navigation
    useEffect(() => {
        return () => {
            if (selectedSeatsRef.current.length > 0) {
                axios.post("/api/seats/release", { showtimeId: showId }).catch(console.error);
            }
        };
    }, [showId]);

    const toggleSeat = async (seat) => {
        // Prevent clicking while a reservation is in progress
        if (reserving) {
            toast.info("Please wait while we process your selection...");
            return;
        }
        if (occupiedSeats.includes(seat.seatName) || reservedSeats.includes(seat.seatName)) return;

        // Use ref to get the latest selectedSeats value
        const currentSeats = selectedSeatsRef.current;
        const isSelected = currentSeats.find(s => s.seatName === seat.seatName);

        // Check seat limit (max 10 seats per booking)
        const MAX_SEATS = 10;
        if (!isSelected && currentSeats.length >= MAX_SEATS) {
            toast.warning(`You can only select up to ${MAX_SEATS} seats per booking.`);
            return;
        }

        setReserving(true);
        setClickedSeat(seat.seatName);

        try {
            let newSelection;

            if (isSelected) {
                newSelection = currentSeats.filter(s => s.seatName !== seat.seatName);
            } else {
                newSelection = [...currentSeats, seat];
            }

            // Reserve seats when user makes a selection
            if (newSelection.length > 0) {
                await reserveSeats(newSelection);
                // Only update UI after successful reservation
                setSelectedSeats(newSelection);
            } else {
                // Release reservation if all seats deselected
                await axios.post("/api/seats/release", { showtimeId: showId });
                setReservationExpiry(null);
                // Only update UI after successful release
                setSelectedSeats(newSelection);
            }
        } catch (error) {
            console.error("Toggle seat error:", error);
            // Don't change selection on error - keep it as is
        } finally {
            setReserving(false);
            setClickedSeat(null);
        }
    };

    const handleTimerExpire = () => {
        toast.warning("Time expired! Your seats have been released.");
        setSelectedSeats([]);
        setReservationExpiry(null);
    };

    const handleProceedToPayment = async () => {
        try {
            // Create payment intent
            const response = await axios.post("/api/payment/create-intent", {
                showtimeId: showId,
                seats: selectedSeats,
            });

            setClientSecret(response.data.clientSecret);
            setPaymentIntentId(response.data.paymentIntentId);
            setShowPayment(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to initialize payment");
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            // Create booking after successful payment
            // This is a fallback for local development where webhooks might not work
            const bookingResponse = await axios.post("/api/bookings", {
                showtimeId: showId,
                seats: selectedSeats,
            });

            if (bookingResponse.data.success) {
                toast.success("Booking confirmed! Redirecting to your profile...");
                setTimeout(() => {
                    router.push("/profile");
                }, 2000);
            } else {
                toast.error("Payment succeeded but booking failed. Please contact support.");
            }
        } catch (error) {
            console.error("Booking creation error:", error);
            toast.error("Payment succeeded but booking failed. Please contact support with payment ID: " + paymentIntentId);
        }
    };

    if (loading) return <Loading message="Loading Seats..." />;
    if (!showTime) return <div className="text-center mt-10">Show not found</div>;

    const { screen, movie } = showTime;
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-2 text-red-500">{movie.title}</h1>
            <p className="text-gray-400 mb-8">
                {showTime.hall.name} - {screen.name} | {new Date(showTime.startTime).toLocaleString()}
            </p>

            {!showPayment ? (
                <>
                    {/* Countdown Timer - Show above screen when seats are selected */}
                    {reservationExpiry && selectedSeats.length > 0 && (
                        <div className="mb-6">
                            <CountdownTimer expiresAt={reservationExpiry} onExpire={handleTimerExpire} />
                        </div>
                    )}

                    {/* Screen Visual */}
                    <div className="w-full max-w-4xl mx-auto bg-gray-700 h-8 mb-10 rounded-t-lg text-center text-gray-400 text-sm leading-8 transform -skew-x-12">
                        SCREEN
                    </div>

                    {/* Seats Grid - Cinema Style */}
                    <div className="max-w-4xl mx-auto overflow-x-auto mb-10">
                        {(() => {
                            // Organize seats by rows
                            const seatsByRow = {};
                            screen.layout.forEach(seat => {
                                const row = seat.seatName.charAt(0); // Get row letter (A, B, C...)
                                if (!seatsByRow[row]) seatsByRow[row] = [];
                                seatsByRow[row].push(seat);
                            });

                            // Sort seats within each row by seat number
                            Object.keys(seatsByRow).forEach(row => {
                                seatsByRow[row].sort((a, b) => {
                                    const numA = parseInt(a.seatName.slice(1));
                                    const numB = parseInt(b.seatName.slice(1));
                                    return numA - numB;
                                });
                            });

                            const rows = Object.keys(seatsByRow).sort();
                            const maxSeatsInRow = Math.max(...Object.values(seatsByRow).map(r => r.length));

                            return (
                                <div className="inline-block min-w-full">
                                    {/* Column Numbers Header */}
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 flex-shrink-0"></div> {/* Space for row labels */}
                                        <div className="flex gap-1 flex-1 justify-center">
                                            {Array.from({ length: maxSeatsInRow }, (_, i) => (
                                                <div key={i} className="w-8 h-6 flex items-center justify-center text-xs text-gray-400 font-semibold">
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seat Rows */}
                                    {rows.map(row => (
                                        <div key={row} className="flex items-center mb-1">
                                            {/* Row Label */}
                                            <div className="w-8 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-400">
                                                {row}
                                            </div>

                                            {/* Seats in this row */}
                                            <div className="flex gap-1 flex-1 justify-center">
                                                {seatsByRow[row].map(seat => {
                                                    const isOccupied = occupiedSeats.includes(seat.seatName);
                                                    const isReservedByOthers = reservedSeats.includes(seat.seatName);
                                                    const isSelected = selectedSeats.find(s => s.seatName === seat.seatName);
                                                    const isClicked = clickedSeat === seat.seatName;

                                                    let seatColor = "bg-gray-600 hover:bg-gray-500";
                                                    if (isOccupied) seatColor = "bg-red-900 cursor-not-allowed";
                                                    else if (isReservedByOthers) seatColor = "bg-yellow-600 cursor-not-allowed";
                                                    else if (isSelected) seatColor = "bg-green-500 hover:bg-green-400";

                                                    // Disable all seats while reserving
                                                    const isDisabled = isOccupied || isReservedByOthers || reserving;

                                                    return (
                                                        <button
                                                            key={seat.seatName}
                                                            onClick={() => toggleSeat(seat)}
                                                            disabled={isDisabled}
                                                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition relative ${seatColor} ${reserving ? 'opacity-50' : ''}`}
                                                            title={`${seat.seatName} - $${seat.price}`}
                                                        >
                                                            {/* Show spinner on clicked seat */}
                                                            {isClicked && reserving && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mb-8 text-sm text-gray-400 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-600 rounded"></div> Available
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div> Your Selection
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-600 rounded"></div> Reserved
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-900 rounded"></div> Booked
                        </div>
                    </div>

                    {/* Booking Summary */}
                    {selectedSeats.length > 0 && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-t-4 border-red-500">
                            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
                            <div className="mb-4">
                                {selectedSeats.map(s => (
                                    <span key={s.seatName} className="inline-block bg-gray-700 px-2 py-1 rounded mr-2 mb-2 text-sm">
                                        {s.seatName} (${s.price})
                                    </span>
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">Total: ${totalPrice}</div>
                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={reserving}
                                    className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-md mx-auto">
                    <button
                        onClick={() => setShowPayment(false)}
                        className="mb-4 text-gray-400 hover:text-white transition flex items-center gap-2"
                    >
                        ← Back to seat selection
                    </button>

                    {clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm onSuccess={handlePaymentSuccess} amount={totalPrice} />
                        </Elements>
                    )}
                </div>
            )}
        </div>
    );
}
