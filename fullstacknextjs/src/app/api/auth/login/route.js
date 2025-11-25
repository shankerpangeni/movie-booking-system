import { connectDB } from "@/lib/connectDb";
import { loginUser } from "@/controllers/user.controller";

export async function POST(req) {
  await connectDB();
  return loginUser(req);
}
