import jwt from "jsonwebtoken";
import User from "@/models/user.model";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

/**
 * Middleware to check JWT cookie and return user
 * @param {Request} req
 * @returns {Promise<{ user: Object }>} - user object if authenticated
 * @throws Response 401 if not authenticated
 */
export const isAuthenticated = async (req) => {
  try {
    // Parse cookies
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.token;

    if (!token) {
      // Throw a Response for Next.js to return 401
      throw new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user without password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }

    return { user };
  } catch (err) {
    console.error(err);
    // If JWT verify fails or user not found
    throw new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }
};
