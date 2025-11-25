import { connectDB } from "@/lib/connectDb";
import { registerUser } from "@/controllers/user.controller";

export async function POST(req) {
  await connectDB();
  return registerUser(req);
}
