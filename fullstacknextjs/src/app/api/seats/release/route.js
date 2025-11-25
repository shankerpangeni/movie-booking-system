import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";
import SeatReservation from "@/models/seatReservation.models";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    try {
        await connectDB();

        // Authenticate User using JWT
        const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
        const token = cookies["token"];

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { showtimeId } = await req.json();

        if (!showtimeId) {
            return NextResponse.json({ error: "Showtime ID is required" }, { status: 400 });
        }

        // Delete the user's reservation for this showtime
        await SeatReservation.deleteOne({
            showtime: showtimeId,
            user: userId,
        });

        return NextResponse.json({ success: true, message: "Reservation released" });
    } catch (error) {
        console.error("Seat release error:", error);
        return NextResponse.json({ error: "Failed to release seats" }, { status: 500 });
    }
}
