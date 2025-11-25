import { connectDB } from "@/lib/connectDb";
import { createScreen, getScreens, updateScreen, deleteScreen } from "@/controllers/screen.controller";

export async function POST(req) {
    await connectDB();
    return createScreen(req);
}

export async function GET(req) {
    await connectDB();
    return getScreens(req);
}

export async function PUT(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    return updateScreen(req, id);
}

export async function DELETE(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    return deleteScreen(req, id);
}
