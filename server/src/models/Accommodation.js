import mongoose from "mongoose";

const ratingBreakdownSchema = new mongoose.Schema(
  {
    cleanliness: { type: Number, min: 0, max: 5, default: 0 },
    communication: { type: Number, min: 0, max: 5, default: 0 },
    checkIn: { type: Number, min: 0, max: 5, default: 0 },
    accuracy: { type: Number, min: 0, max: 5, default: 0 },
    location: { type: Number, min: 0, max: 5, default: 0 },
    value: { type: Number, min: 0, max: 5, default: 0 },
  },
  { _id: false },
);

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required."], trim: true, maxlength: 120 },
    location: { type: String, required: [true, "Location is required."], trim: true, index: true },
    description: { type: String, required: [true, "Description is required."], trim: true, maxlength: 3000 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    guests: { type: Number, required: true, min: 1 },
    beds: { type: Number, min: 0, default: 1 },
    type: {
      type: String,
      enum: ["Entire home", "Private room", "Shared room", "Hotel room"],
      default: "Entire home",
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    weeklyDiscount: { type: Number, min: 0, max: 100, default: 0 },
    cleaningFee: { type: Number, min: 0, default: 0 },
    serviceFee: { type: Number, min: 0, default: 0 },
    occupancyTaxes: { type: Number, min: 0, default: 0 },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    enhancedCleaning: { type: Boolean, default: false },
    selfCheckIn: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    specificRatings: { type: ratingBreakdownSchema, default: () => ({}) },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

accommodationSchema.index({ title: "text", location: "text", description: "text" });

export const Accommodation = mongoose.model("Accommodation", accommodationSchema);
