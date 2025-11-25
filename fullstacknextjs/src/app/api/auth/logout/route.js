import { connectDB } from "@/lib/connectDb";
import { logoutUser } from "@/controllers/user.controller";

export async function POST(req) {
  await connectDB();
  return logoutUser(req);
}
