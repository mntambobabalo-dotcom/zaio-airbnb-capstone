import { Accommodation } from "../models/Accommodation.js";
import { Reservation } from "../models/Reservation.js";
import { calculateReservationTotal } from "../utils/calculateReservationTotal.js";

const reservationPopulate = [
  { path: "accommodation", select: "title location images price" },
  { path: "user", select: "username email" },
  { path: "host", select: "username email" },
];

export async function createReservation(req, res) {
  const { accommodationId, checkIn, checkOut, guests } = req.body;
  if (!accommodationId || !checkIn || !checkOut || !guests) {
    return res.status(400).json({ message: "Accommodation, dates and guest count are required." });
  }

  const accommodation = await Accommodation.findById(accommodationId);
  if (!accommodation) return res.status(404).json({ message: "Accommodation not found." });
  if (Number(guests) > accommodation.guests) {
    return res.status(400).json({ message: `This property allows a maximum of ${accommodation.guests} guests.` });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ message: "Enter valid check-in and check-out dates." });
  }

  const conflict = await Reservation.exists({
    accommodation: accommodation.id,
    status: "confirmed",
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  });
  if (conflict) return res.status(409).json({ message: "Those dates are no longer available." });

  const calculation = calculateReservationTotal(accommodation, start, end);
  const reservation = await Reservation.create({
    accommodation: accommodation.id,
    user: req.user.id,
    host: accommodation.host,
    checkIn: start,
    checkOut: end,
    guests: Number(guests),
    nights: calculation.nights,
    priceBreakdown: {
      nightlySubtotal: calculation.nightlySubtotal,
      weeklyDiscount: calculation.weeklyDiscount,
      cleaningFee: calculation.cleaningFee,
      serviceFee: calculation.serviceFee,
      occupancyTaxes: calculation.occupancyTaxes,
    },
    total: calculation.total,
  });

  await reservation.populate(reservationPopulate);
  res.status(201).json(reservation);
}

export async function getUserReservations(req, res) {
  const reservations = await Reservation.find({ user: req.user.id })
    .populate(reservationPopulate)
    .sort({ checkIn: -1 });
  res.json(reservations);
}

export async function getHostReservations(req, res) {
  const filter = req.user.role === "admin" ? {} : { host: req.user.id };
  const reservations = await Reservation.find(filter)
    .populate(reservationPopulate)
    .sort({ createdAt: -1 });
  res.json(reservations);
}

export async function deleteReservation(req, res) {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: "Reservation not found." });

  const canDelete = req.user.role === "admin"
    || reservation.user.toString() === req.user.id
    || reservation.host.toString() === req.user.id;
  if (!canDelete) {
    return res.status(403).json({ message: "You cannot delete this reservation." });
  }

  await reservation.deleteOne();
  res.status(204).send();
}
