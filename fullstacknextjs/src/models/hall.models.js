import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Hall || mongoose.model("Hall", hallSchema);
