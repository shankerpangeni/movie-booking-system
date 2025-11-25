import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // in minutes
    releaseDate: { type: Date },
    genre: { type: [String] }, // array of genres
    coverImage: { type: String }, // Cloudinary URL
    poster: { type: String }, // Cloudinary URL
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String }, // optional role/character name
        image: { type: String }, // optional Cloudinary URL for actor
      },
    ],
    rating: { type: Number, min: 0, max: 10 },
    status: {
      type: String,
      enum: ['now-showing', 'upcoming'],
      default: 'now-showing'
    },
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema);
