import mongoose from "mongoose";

const showTimeSchema = new mongoose.Schema(
  {
    hall: { type: mongoose.Schema.Types.ObjectId, ref: "Hall", required: true },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ShowTime || mongoose.model("ShowTime", showTimeSchema);
