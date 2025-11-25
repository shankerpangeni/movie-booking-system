import mongoose from "mongoose";

const seatReservationSchema = new mongoose.Schema(
    {
        showtime: { type: mongoose.Schema.Types.ObjectId, ref: "ShowTime", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        seats: [{ type: String, required: true }], // Array of seat names (e.g., ["A1", "A2"])
        expiresAt: { type: Date, required: true, index: true }, // TTL index for auto-deletion
    },
    { timestamps: true }
);

// Create TTL index to automatically delete expired reservations
seatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure one user can only have one active reservation per showtime
seatReservationSchema.index({ showtime: 1, user: 1 }, { unique: true });

export default mongoose.models.SeatReservation || mongoose.model("SeatReservation", seatReservationSchema);
