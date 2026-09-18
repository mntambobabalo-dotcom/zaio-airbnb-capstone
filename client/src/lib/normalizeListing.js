import { assets } from "../data/assets";

export function normalizeListing(listing) {
  const images = listing.images?.length ? listing.images : assets.listingGallery;
  const paddedImages = Array.from({ length: 5 }, (_, index) => images[index % images.length]);
  return {
    ...listing,
    id: listing._id ?? listing.id,
    host: listing.host?.username ?? listing.host ?? "Zaio Host",
    images: paddedImages,
    searchImage: images[0],
    bedroomImage: images[1] ?? images[0],
    bedrooms: listing.bedrooms ?? 1,
    bathrooms: listing.bathrooms ?? 1,
    beds: listing.beds ?? 1,
    amenities: listing.amenities ?? [],
    weeklyDiscount: listing.weeklyDiscount ?? 0,
    cleaningFee: listing.cleaningFee ?? 0,
    serviceFee: listing.serviceFee ?? 0,
    occupancyTaxes: listing.occupancyTaxes ?? 0,
    reviews: listing.reviews ?? 0,
    rating: listing.rating ?? 0,
  };
}
