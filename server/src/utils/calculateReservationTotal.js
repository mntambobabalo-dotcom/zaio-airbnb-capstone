export function calculateReservationTotal(accommodation, checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const millisecondsPerNight = 1000 * 60 * 60 * 24;
  const nights = Math.ceil((end.getTime() - start.getTime()) / millisecondsPerNight);

  if (!Number.isFinite(nights) || nights < 1) {
    throw Object.assign(new Error("Check-out must be after check-in."), { statusCode: 400 });
  }

  const nightlySubtotal = accommodation.price * nights;
  const weeklyDiscount = nights >= 7
    ? nightlySubtotal * ((accommodation.weeklyDiscount ?? 0) / 100)
    : 0;
  const cleaningFee = accommodation.cleaningFee ?? 0;
  const serviceFee = accommodation.serviceFee ?? 0;
  const occupancyTaxes = accommodation.occupancyTaxes ?? 0;
  const total = nightlySubtotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;

  return {
    nights,
    nightlySubtotal: roundCurrency(nightlySubtotal),
    weeklyDiscount: roundCurrency(weeklyDiscount),
    cleaningFee: roundCurrency(cleaningFee),
    serviceFee: roundCurrency(serviceFee),
    occupancyTaxes: roundCurrency(occupancyTaxes),
    total: roundCurrency(total),
  };
}

function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
