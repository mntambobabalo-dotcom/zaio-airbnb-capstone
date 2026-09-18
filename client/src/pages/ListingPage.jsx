import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { assets } from "../data/assets";
import { listings } from "../data/listings";
import { apiRequest } from "../lib/api";
import { normalizeListing } from "../lib/normalizeListing";

function differenceInNights(start, end) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  return Math.max(1, Math.round((endDate - startDate) / 86400000) || 1);
}

function getDefaultBookingDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 7);

  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

export default function ListingPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const fallbackListing = normalizeListing(listings.find((item) => item.id === listingId) || listings[0]);
  const [listing, setListing] = useState(fallbackListing);
  const [loading, setLoading] = useState(/^[a-f\d]{24}$/i.test(listingId));
  const defaultDates = useMemo(getDefaultBookingDates, []);
  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [guests, setGuests] = useState(Math.min(2, fallbackListing.guests));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(listingId)) return;
    const controller = new AbortController();
    apiRequest(`/accommodations/${listingId}`, { signal: controller.signal })
      .then((response) => {
        const normalized = normalizeListing(response);
        setListing(normalized);
        setGuests((current) => Math.min(current, normalized.guests));
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [listingId]);

  const price = useMemo(() => {
    const nights = differenceInNights(checkIn, checkOut);
    const accommodation = listing.price * nights;
    const discount = nights >= 7 ? Math.round(accommodation * (listing.weeklyDiscount / 100) * 100) / 100 : 0;
    const total = accommodation - discount + listing.cleaningFee + listing.serviceFee + listing.occupancyTaxes;
    return { nights, accommodation, discount, total };
  }, [checkIn, checkOut, listing]);

  async function reserve() {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${listingId}` } });
      return;
    }
    if (!/^[a-f\d]{24}$/i.test(listing.id)) {
      setError("Start the API and seed MongoDB before reserving a sample listing.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      await apiRequest("/reservations", {
        method: "POST",
        token,
        body: { accommodationId: listing.id, checkIn, checkOut, guests },
      });
      setMessage("Reservation confirmed successfully.");
      window.setTimeout(() => navigate("/reservations"), 700);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main><Header showSearch /><div className="route-loader">Loading listing…</div></main>;

  return (
    <main>
      <Header showSearch />
      <div className="listing-shell page-shell">
        <section className="listing-title">
          <h1>{listing.title}</h1>
          <div><span>★ {listing.rating}</span><span>·</span><a href="#reviews">{listing.reviews} reviews</a><span>·</span><a href="#location">{listing.location}</a><span className="title-spacer" /><button type="button">↗ Share</button><button type="button">♡ Save</button></div>
        </section>

        <section className="image-gallery" aria-label="Listing photos">
          {listing.images.map((image, index) => <img src={image} alt={`${listing.title} view ${index + 1}`} key={image} />)}
          <button type="button">▦ &nbsp; Show all photos</button>
        </section>

        <div className="listing-columns">
          <div className="listing-content">
            <section className="host-summary">
              <div><h2>{listing.type} hosted by {listing.host}</h2><p>{listing.guests} guests · {listing.bedrooms} bedroom · {listing.beds} bed · {listing.bathrooms} bath</p></div>
              <img src={assets.hostAvatar} alt={listing.host} />
            </section>

            <section className="feature-list">
              <div><span>⌂</span><p><strong>Entire home</strong><small>You’ll have the apartment to yourself.</small></p></div>
              <div><span>✣</span><p><strong>Enhanced Clean</strong><small>This host follows a five-step cleaning process.</small></p></div>
              <div><span>▣</span><p><strong>Self check-in</strong><small>Check yourself in with the keypad.</small></p></div>
              <div><span>□</span><p><strong>Free cancellation</strong><small>Cancel before the selected check-in date.</small></p></div>
            </section>

            <section className="content-section"><p>{listing.description}</p><button className="text-button" type="button">Show more ›</button></section>
            <section className="content-section"><h2>Where you’ll sleep</h2><article className="bedroom-card"><img src={listing.bedroomImage} alt="Bedroom" /><strong>Bedroom</strong><span>1 queen bed</span></article></section>
            <section className="content-section"><h2>What this place offers</h2><div className="amenities-grid">{listing.amenities.map((amenity) => <span key={amenity}>◇ &nbsp; {amenity}</span>)}</div><button className="outline-button" type="button">Show all {listing.amenities.length + 23} amenities</button></section>
            <section className="content-section" id="reviews"><h2>★ {listing.rating} · {listing.reviews} reviews</h2><div className="rating-grid">{["Cleanliness", "Accuracy", "Communication", "Location", "Check-in", "Value"].map((name, index) => <div key={name}><span>{name}</span><progress max="5" value={index > 3 ? 4.8 : 5} /><small>{index > 3 ? "4.8" : "5.0"}</small></div>)}</div></section>
          </div>

          <aside className="booking-card">
            <div className="booking-heading"><span><strong>${listing.price}</strong> / night</span><span>★ {listing.rating} · <u>{listing.reviews} reviews</u></span></div>
            <div className="booking-inputs">
              <label><span>CHECK-IN</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label>
              <label><span>CHECKOUT</span><input type="date" min={checkIn} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></label>
              <label className="guest-input"><span>GUESTS</span><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{Array.from({ length: listing.guests }, (_, index) => index + 1).map((amount) => <option value={amount} key={amount}>{amount} guest{amount > 1 ? "s" : ""}</option>)}</select></label>
            </div>
            <button className="reserve-button" type="button" onClick={reserve} disabled={submitting}>{submitting ? "Reserving…" : user ? "Reserve" : "Log in to reserve"}</button>
            <p className="no-charge">You won’t be charged yet</p>
            <div className="price-lines">
              <div><span>${listing.price} × {price.nights} nights</span><span>${price.accommodation}</span></div>
              {price.discount > 0 && <div className="discount"><span>Weekly discount</span><span>−${price.discount}</span></div>}
              <div><span>Cleaning fee</span><span>${listing.cleaningFee}</span></div>
              <div><span>Service fee</span><span>${listing.serviceFee}</span></div>
              <div><span>Occupancy taxes and fees</span><span>${listing.occupancyTaxes}</span></div>
            </div>
            <div className="booking-total"><strong>Total</strong><strong>${price.total}</strong></div>
            {message && <p className="success-message" role="status">{message}</p>}
            {error && <p className="form-error" role="alert">{error}</p>}
          </aside>
        </div>
        <section className="things-to-know" id="location"><h2>Things to know</h2><div><article><h3>House rules</h3><p>Check-in after 3:00 PM</p><p>Checkout before 11:00 AM</p><p>No smoking</p></article><article><h3>Health & safety</h3><p>Security camera on property</p><p>Carbon monoxide alarm</p><p>Smoke alarm</p></article><article><h3>Cancellation policy</h3><p>Free cancellation before check-in.</p><Link to="/search">Show more ›</Link></article></div></section>
      </div>
      <Footer />
    </main>
  );
}
