import User from "@/models/user.models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { cloudinaryUploader, toNodeReq, runMiddleware } from "@/lib/upload.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

// -------- REGISTER --------
export const registerUser = async (req) => {
  try {
    const { name, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage },
      }),
      { status: 201, headers: { "Set-Cookie": cookie.serialize(COOKIE_NAME, token, COOKIE_OPTIONS) } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
};

// -------- LOGIN --------
export const loginUser = async (req) => {
  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 400 });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return new Response(
      JSON.stringify({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } }),
      { status: 200, headers: { "Set-Cookie": cookie.serialize(COOKIE_NAME, token, COOKIE_OPTIONS) } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
};

// -------- LOGOUT --------
export const logoutUser = async () => {
  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: { "Set-Cookie": cookie.serialize(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 }) },
  });
};

// -------- GET CURRENT USER --------
export const getCurrentUser = async (req) => {
  try {
    const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
    const token = cookies[COOKIE_NAME];

    if (!token) return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
  }
};

// -------- UPDATE USER (Profile) --------
export const updateUser = async (req) => {
  try {
    // 1. Authenticate and get User ID
    const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
    const token = cookies[COOKIE_NAME];

    if (!token) return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }

    const userId = decoded.id;

    // 2. Prepare Upload with User ID
    const nodeReq = toNodeReq(req);
    const nodeRes = {
      setHeader: () => { },
      getHeader: () => { },
      end: () => { },
    };

    // Upload profile image
    const upload = cloudinaryUploader("users", userId).single("profileImage");

    await runMiddleware(nodeReq, nodeRes, upload);

    // 3. Update User in DB
    const updateData = { ...nodeReq.body };

    if (nodeReq.file?.path) {
      updateData.profileImage = nodeReq.file.path;
    }

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Profile updated", user }), { status: 200 });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
};
