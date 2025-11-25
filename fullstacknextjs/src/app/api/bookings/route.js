import { connectDB } from "@/lib/connectDb";
import { createBooking, getBookings } from "@/controllers/booking.controller";

export async function POST(req) {
    await connectDB();
    return createBooking(req);
}

export async function GET(req) {
    await connectDB();
    return getBookings(req);
}
