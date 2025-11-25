import { connectDB } from "@/lib/connectDb";
import { getCurrentUser, updateUser } from "@/controllers/user.controller";

export async function GET(req) {
  await connectDB();
  return getCurrentUser(req);
}

export async function PUT(req) {
  await connectDB();
  return updateUser(req);
}
