import mongoose from "mongoose";

const bookedSeatSchema = new mongoose.Schema({
  seatName: { type: String, required: true },
  price: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      default: () => {
        // Generate unique booking reference: BK-YYYYMMDD-RANDOM
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `BK-${date}-${random}`;
      }
    },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: "ShowTime", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seats: [bookedSeatSchema], // Array of booked seats with price
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
    paymentIntentId: { type: String }, // Stripe payment intent
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
