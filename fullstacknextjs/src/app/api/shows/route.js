import { connectDB } from "@/lib/connectDb";
import { createShowTime, getShowTimes, deleteShowTime } from "@/controllers/showTime.controller";

export async function POST(req) {
    await connectDB();
    return createShowTime(req);
}

export async function GET(req) {
    await connectDB();
    return getShowTimes(req);
}

export async function DELETE(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    return deleteShowTime(req, id);
}
