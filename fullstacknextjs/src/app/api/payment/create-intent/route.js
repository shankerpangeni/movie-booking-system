import { connectDB } from "@/lib/connectDb";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    try {
        await connectDB();

        // Authenticate user
        const cookies = req.headers.get("cookie") ? cookie.parse(req.headers.get("cookie")) : {};
        const token = cookies["token"];
        if (!token) {
            return new Response(
                JSON.stringify({ success: false, message: "Not authenticated" }),
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { showtimeId, seats } = await req.json();

        if (!seats || seats.length === 0) {
            return new Response(
                JSON.stringify({ success: false, message: "No seats selected" }),
                { status: 400 }
            );
        }

        // Calculate total amount (in cents for Stripe)
        const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
        const amountInCents = Math.round(totalAmount * 100);

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            metadata: {
                userId,
                showtimeId,
                seats: JSON.stringify(seats),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error("CREATE PAYMENT INTENT ERROR:", err);
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500 }
        );
    }
}
