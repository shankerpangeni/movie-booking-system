import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";
import SeatReservation from "@/models/seatReservation.models";
import Booking from "@/models/booking.models";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    const session = await connectDB().then(() => SeatReservation.startSession());

    try {
        session.startTransaction();

        // Authenticate User using JWT
        const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
        const token = cookies["token"];

        if (!token) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { showtimeId, seats } = await req.json();

        if (!showtimeId || !seats || seats.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: "Showtime ID and seats are required" }, { status: 400 });
        }

        // Check if seats are already booked (permanent) - within transaction
        const existingBookings = await Booking.find({ showtime: showtimeId, paymentStatus: "paid" }).session(session);
        const bookedSeats = existingBookings.flatMap(b => b.seats.map(s => s.seatName));
        const conflictingBooked = seats.filter(seat => bookedSeats.includes(seat));

        if (conflictingBooked.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: `Seats already booked: ${conflictingBooked.join(", ")}` },
                { status: 409 }
            );
        }

        // Check if seats are reserved by another user - within transaction
        const activeReservations = await SeatReservation.find({
            showtime: showtimeId,
            user: { $ne: userId },
            expiresAt: { $gt: new Date() },
        }).session(session);

        const reservedSeats = activeReservations.flatMap(r => r.seats);
        const conflictingReserved = seats.filter(seat => reservedSeats.includes(seat));

        if (conflictingReserved.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: `Seats already reserved by another user: ${conflictingReserved.join(", ")}` },
                { status: 409 }
            );
        }

        // Create or update reservation for this user (10 minutes from now) - within transaction
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const reservation = await SeatReservation.findOneAndUpdate(
            { showtime: showtimeId, user: userId },
            { seats, expiresAt },
            { upsert: true, new: true, session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            reservation: {
                id: reservation._id,
                seats: reservation.seats,
                expiresAt: reservation.expiresAt,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Seat reservation error:", error);
        return NextResponse.json({ error: "Failed to reserve seats" }, { status: 500 });
    }
}

