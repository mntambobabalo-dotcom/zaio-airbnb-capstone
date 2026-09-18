import { Accommodation } from "../models/Accommodation.js";

const editableFields = [
  "title",
  "location",
  "description",
  "bedrooms",
  "bathrooms",
  "guests",
  "beds",
  "type",
  "price",
  "weeklyDiscount",
  "cleaningFee",
  "serviceFee",
  "occupancyTaxes",
  "amenities",
  "images",
  "enhancedCleaning",
  "selfCheckIn",
  "rating",
  "reviews",
  "specificRatings",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canManage(user, accommodation) {
  return user.role === "admin" || accommodation.host.toString() === user.id;
}

export async function listAccommodations(req, res) {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
  const filter = {};

  if (req.query.location) {
    filter.location = { $regex: escapeRegex(req.query.location.trim()), $options: "i" };
  }
  if (req.query.guests) filter.guests = { $gte: Number(req.query.guests) };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { rating: -1 },
  };
  const sort = sortOptions[req.query.sort] ?? sortOptions.newest;

  const [items, total] = await Promise.all([
    Accommodation.find(filter)
      .populate("host", "username")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Accommodation.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function getAccommodation(req, res) {
  const accommodation = await Accommodation.findById(req.params.id).populate("host", "username email");
  if (!accommodation) return res.status(404).json({ message: "Accommodation not found." });
  res.json(accommodation);
}

export async function getHostAccommodations(req, res) {
  const filter = req.user.role === "admin" ? {} : { host: req.user.id };
  const accommodations = await Accommodation.find(filter)
    .populate("host", "username email")
    .sort({ createdAt: -1 });
  res.json(accommodations);
}

export async function createAccommodation(req, res) {
  const payload = Object.fromEntries(
    editableFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]),
  );
  const accommodation = await Accommodation.create({ ...payload, host: req.user.id });
  res.status(201).json(accommodation);
}

export async function updateAccommodation(req, res) {
  const accommodation = await Accommodation.findById(req.params.id);
  if (!accommodation) return res.status(404).json({ message: "Accommodation not found." });
  if (!canManage(req.user, accommodation)) {
    return res.status(403).json({ message: "You can only edit your own listings." });
  }

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) accommodation[field] = req.body[field];
  });
  await accommodation.save();
  res.json(accommodation);
}

export async function deleteAccommodation(req, res) {
  const accommodation = await Accommodation.findById(req.params.id);
  if (!accommodation) return res.status(404).json({ message: "Accommodation not found." });
  if (!canManage(req.user, accommodation)) {
    return res.status(403).json({ message: "You can only delete your own listings." });
  }

  await accommodation.deleteOne();
  res.status(204).send();
}
