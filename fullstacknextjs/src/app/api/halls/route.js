import { connectDB } from "@/lib/connectDb";
import { createHall, getHalls, updateHall, deleteHall } from "@/controllers/hall.controller";

export async function POST(req) {
    await connectDB();
    return createHall(req);
}

export async function GET(req) {
    await connectDB();
    return getHalls();
}

export async function PUT(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    return updateHall(req, id);
}

export async function DELETE(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    return deleteHall(req, id);
}
