import { connectDB } from "@/lib/connectDb";
import Booking from "@/models/booking.models";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    try {
        await connectDB();

        const body = await req.text();
        const headersList = headers();
        const signature = headersList.get("stripe-signature");

        if (!signature) {
            return new Response(
                JSON.stringify({ success: false, message: "No signature" }),
                { status: 400 }
            );
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return new Response(
                JSON.stringify({ success: false, message: `Webhook Error: ${err.message}` }),
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;

                // Extract metadata
                const { userId, showtimeId, seats } = paymentIntent.metadata;
                const parsedSeats = JSON.parse(seats);

                // Create booking with paid status
                const booking = await Booking.create({
                    showtime: showtimeId,
                    user: userId,
                    seats: parsedSeats,
                    paymentStatus: "paid",
                    paymentIntentId: paymentIntent.id,
                });

                console.log("Booking created successfully:", booking._id);
                break;

            case "payment_intent.payment_failed":
                const failedPayment = event.data.object;
                console.error("Payment failed:", failedPayment.id);
                // Optionally: Create booking with failed status or send notification
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(
            JSON.stringify({ success: true, received: true }),
            { status: 200 }
        );
    } catch (err) {
        console.error("WEBHOOK ERROR:", err);
        return new Response(
            JSON.stringify({ success: false, message: err.message }),
            { status: 500 }
        );
    }
}
