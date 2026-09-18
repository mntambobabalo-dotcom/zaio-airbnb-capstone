import mongoose from "mongoose";

const priceBreakdownSchema = new mongoose.Schema(
  {
    nightlySubtotal: { type: Number, required: true, min: 0 },
    weeklyDiscount: { type: Number, default: 0, min: 0 },
    cleaningFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    occupancyTaxes: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const reservationSchema = new mongoose.Schema(
  {
    accommodation: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkIn: { type: Date, required: true },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.checkIn || value > this.checkIn;
        },
        message: "Check-out must be after check-in.",
      },
    },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 1 },
    priceBreakdown: { type: priceBreakdownSchema, required: true },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true },
);

reservationSchema.index({ accommodation: 1, checkIn: 1, checkOut: 1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);
