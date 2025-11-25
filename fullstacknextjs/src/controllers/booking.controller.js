import Booking from "@/models/booking.models";
import SeatReservation from "@/models/seatReservation.models";
import ShowTime from "@/models/showTime.models";
import User from "@/models/user.models";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { sendBookingConfirmationEmail } from "@/lib/emailService";

const JWT_SECRET = process.env.JWT_SECRET;

// Create Booking
export const createBooking = async (req) => {
    try {
        // 1. Authenticate User
        const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
        const token = cookies["token"];
        if (!token) return new Response(JSON.stringify({ success: false, message: "Not authenticated" }), { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { showtimeId, seats } = await req.json(); // seats: [{ seatName: "A1", price: 100 }]

        // 2. Check if seats are already booked
        const existingBookings = await Booking.find({ showtime: showtimeId });
        const bookedSeatNames = existingBookings.flatMap(b => b.seats.map(s => s.seatName));

        const requestedSeatNames = seats.map(s => s.seatName);
        const isAvailable = requestedSeatNames.every(seat => !bookedSeatNames.includes(seat));

        if (!isAvailable) {
            return new Response(JSON.stringify({ success: false, message: "One or more seats are already booked" }), { status: 400 });
        }

        // 3. Create Booking
        const booking = await Booking.create({
            showtime: showtimeId,
            user: userId,
            seats,
            paymentStatus: "paid", // Simulating payment for now
        });

        // 4. Delete the user's reservation after successful booking
        await SeatReservation.deleteOne({ showtime: showtimeId, user: userId });

        // 5. Populate booking data for email
        const populatedBooking = await Booking.findById(booking._id)
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie', select: 'title poster' },
                    { path: 'hall', select: 'name' },
                    { path: 'screen', select: 'name' }
                ]
            })
            .populate('user', 'name email');

        // 6. Send confirmation email with QR code
        try {
            const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

            const emailResult = await sendBookingConfirmationEmail({
                userEmail: populatedBooking.user.email,
                userName: populatedBooking.user.name,
                bookingReference: populatedBooking.bookingReference,
                movieTitle: populatedBooking.showtime.movie.title,
                moviePoster: populatedBooking.showtime.movie.poster,
                hallName: populatedBooking.showtime.hall.name,
                screenName: populatedBooking.showtime.screen.name,
                showtime: populatedBooking.showtime.startTime,
                seats: populatedBooking.seats,
                totalPrice: totalPrice,
            });

            if (emailResult.success) {
                console.log('✅ Booking confirmation email sent to:', populatedBooking.user.email);
            } else {
                console.warn('⚠️ Booking created but email failed:', emailResult.error);
            }
        } catch (emailError) {
            // Log error but don't fail the booking
            console.error('❌ Email sending error:', emailError);
        }

        return new Response(JSON.stringify({ success: true, booking }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Get Bookings (For User or ShowTime) + Active Reservations
export const getBookings = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const showtimeId = searchParams.get("showtimeId");
        const userId = searchParams.get("userId"); // Optional: Admin or User viewing own bookings

        let query = {};
        if (showtimeId) query.showtime = showtimeId;

        // If userId is provided, filter by user. 
        // In a real app, we should verify the token matches the userId or is admin.
        if (userId) query.user = userId;

        // If no params, maybe return user's own bookings based on token?
        if (!showtimeId && !userId) {
            const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
            const token = cookies["token"];
            if (token) {
                const decoded = jwt.verify(token, JWT_SECRET);
                query.user = decoded.id;
            }
        }

        const bookings = await Booking.find(query)
            .populate({
                path: "showtime",
                populate: { path: "movie", select: "title poster" }
            })
            .populate("showtime.hall")
            .populate("showtime.screen");

        // Also fetch active reservations for this showtime
        let reservations = [];
        if (showtimeId) {
            reservations = await SeatReservation.find({
                showtime: showtimeId,
                expiresAt: { $gt: new Date() }, // Only active reservations
            }).populate("user", "name email");
        }

        return new Response(JSON.stringify({
            success: true,
            bookings,
            reservations: reservations.map(r => ({
                userId: r.user._id,
                userName: r.user.name,
                seats: r.seats,
                expiresAt: r.expiresAt,
            }))
        }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

