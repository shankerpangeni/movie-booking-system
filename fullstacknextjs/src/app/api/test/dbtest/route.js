import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDb";

export async function GET() {
  try {
    await connectDB(); // Connect to MongoDB
    return NextResponse.json({ message: "DB Connected Successfully!" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
