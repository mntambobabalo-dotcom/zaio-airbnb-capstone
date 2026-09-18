import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { Accommodation } from "../models/Accommodation.js";
import { User } from "../models/User.js";

const hostEmail = "host@zaioairbnb.test";
const guestEmail = "guest@zaioairbnb.test";

async function upsertDemoUser({ username, email, password, role }) {
  let user = await User.findOne({ email }).select("+password");
  if (!user) user = new User({ username, email, password, role });
  else {
    user.username = username;
    user.role = role;
    user.password = password;
  }
  await user.save();
  return user;
}

async function seed() {
  await connectDatabase();

  const host = await upsertDemoUser({
    username: "Zaio Host",
    email: hostEmail,
    password: process.env.SEED_HOST_PASSWORD ?? "Host1234!",
    role: "host",
  });
  await upsertDemoUser({
    username: "Zaio Guest",
    email: guestEmail,
    password: process.env.SEED_GUEST_PASSWORD ?? "Guest1234!",
    role: "user",
  });

  const listings = [
    {
      title: "Bordeaux Getaway",
      location: "Bordeaux, France",
      description: "Come and stay in this superb duplex in the heart of the historic centre of Bordeaux. Spacious and bright, it is close to shops, restaurants and public transport.",
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      guests: 2,
      type: "Entire home",
      price: 79,
      weeklyDiscount: 5,
      cleaningFee: 62,
      serviceFee: 83,
      occupancyTaxes: 29,
      amenities: ["Garden view", "Kitchen", "Wifi", "Pets allowed", "Washer", "Air conditioning"],
      images: [
        "/images/gallery-1.jpg",
        "/images/gallery-2.jpg",
        "/images/gallery-3.jpg",
        "/images/gallery-4.jpg",
        "/images/gallery-5.jpg",
      ],
      enhancedCleaning: true,
      selfCheckIn: true,
      rating: 5,
      reviews: 7,
      specificRatings: { cleanliness: 5, communication: 5, checkIn: 5, accuracy: 5, location: 4.8, value: 4.8 },
    },
    {
      title: "Charming Waterfront Condo",
      location: "Bordeaux, France",
      description: "A bright waterfront stay with generous living space and quick access to the best of Bordeaux.",
      bedrooms: 3,
      bathrooms: 3,
      beds: 5,
      guests: 6,
      type: "Entire home",
      price: 200,
      weeklyDiscount: 3,
      cleaningFee: 55,
      serviceFee: 70,
      occupancyTaxes: 25,
      amenities: ["Waterfront", "Kitchen", "Wifi", "Free parking"],
      images: [
        "/images/search-waterfront.jpg",
        "/images/gallery-2.jpg",
        "/images/gallery-3.jpg",
        "/images/gallery-4.jpg",
        "/images/gallery-5.jpg",
      ],
      enhancedCleaning: true,
      selfCheckIn: false,
      rating: 5,
      reviews: 318,
      specificRatings: { cleanliness: 5, communication: 4.9, checkIn: 4.9, accuracy: 4.9, location: 5, value: 4.8 },
    },
    {
      title: "Historic City Center Home",
      location: "Bordeaux, France",
      description: "A peaceful historic home with authentic character, modern comforts and a private courtyard.",
      bedrooms: 2,
      bathrooms: 2,
      beds: 3,
      guests: 4,
      type: "Entire home",
      price: 125,
      weeklyDiscount: 4,
      cleaningFee: 50,
      serviceFee: 60,
      occupancyTaxes: 25,
      amenities: ["Courtyard", "Kitchen", "Wifi", "Free parking"],
      images: [
        "/images/search-historic.jpg",
        "/images/gallery-3.jpg",
        "/images/gallery-1.jpg",
        "/images/gallery-4.jpg",
        "/images/gallery-5.jpg",
      ],
      enhancedCleaning: false,
      selfCheckIn: true,
      rating: 4.9,
      reviews: 112,
      specificRatings: { cleanliness: 4.9, communication: 4.9, checkIn: 4.8, accuracy: 4.9, location: 5, value: 4.8 },
    },
  ];

  for (const listing of listings) {
    await Accommodation.findOneAndUpdate(
      { title: listing.title, host: host.id },
      { ...listing, host: host.id },
      { upsert: true, new: true, runValidators: true },
    );
  }

  console.log(`Seeded ${listings.length} listings.`);
  console.log(`Host login: ${hostEmail}`);
  console.log(`Guest login: ${guestEmail}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
