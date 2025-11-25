import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatName: { type: String, required: true }, // e.g., "A1"
  type: { type: String, enum: ["regular", "premium", "vip"], default: "regular" },
  price: { type: Number, required: true },
});

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
    layout: [seatSchema], // Array of seats
  },
  { timestamps: true }
);

export default mongoose.models.Screen || mongoose.model("Screen", screenSchema);
