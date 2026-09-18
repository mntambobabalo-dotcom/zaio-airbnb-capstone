import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { Accommodation } from "../src/models/Accommodation.js";
import { Reservation } from "../src/models/Reservation.js";

const objectId = () => new mongoose.Types.ObjectId();

describe("Mongoose model validation", () => {
  it("requires the core accommodation fields", () => {
    const accommodation = new Accommodation({ title: "Incomplete listing" });
    const error = accommodation.validateSync();

    expect(error.errors.location).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.host).toBeDefined();
  });

  it("rejects a reservation whose check-out is before check-in", () => {
    const reservation = new Reservation({
      accommodation: objectId(),
      user: objectId(),
      host: objectId(),
      checkIn: new Date("2026-09-10"),
      checkOut: new Date("2026-09-09"),
      guests: 2,
      nights: 1,
      priceBreakdown: { nightlySubtotal: 1000 },
      total: 1000,
    });
    const error = reservation.validateSync();

    expect(error.errors.checkOut.message).toContain("after check-in");
  });
});
