import { describe, expect, it } from "vitest";
import { calculateReservationTotal } from "../src/utils/calculateReservationTotal.js";

describe("reservation price calculator", () => {
  const accommodation = {
    price: 1000,
    weeklyDiscount: 10,
    cleaningFee: 200,
    serviceFee: 150,
    occupancyTaxes: 50,
  };

  it("adds fees for a short stay", () => {
    const result = calculateReservationTotal(accommodation, "2026-09-10", "2026-09-13");

    expect(result.nights).toBe(3);
    expect(result.weeklyDiscount).toBe(0);
    expect(result.total).toBe(3400);
  });

  it("applies the weekly discount to seven-night stays", () => {
    const result = calculateReservationTotal(accommodation, "2026-09-10", "2026-09-17");

    expect(result.weeklyDiscount).toBe(700);
    expect(result.total).toBe(6700);
  });

  it("rejects an invalid date range", () => {
    expect(() => calculateReservationTotal(accommodation, "2026-09-10", "2026-09-10"))
      .toThrow("Check-out must be after check-in");
  });
});
