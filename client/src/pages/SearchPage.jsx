import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { listings } from "../data/listings";
import { apiRequest } from "../lib/api";
import { normalizeListing } from "../lib/normalizeListing";

export default function SearchPage() {
  const [params] = useSearchParams();
  const [maxPrice, setMaxPrice] = useState(400);
  const [liked, setLiked] = useState(new Set(["waterfront-condo"]));
  const [apiListings, setApiListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const location = params.get("location") || "Bordeaux";
  const guests = params.get("guests") || "1";
  const visibleListings = useMemo(
    () => (apiListings ?? listings).map(normalizeListing).filter((listing) => listing.price <= maxPrice),
    [apiListings, maxPrice],
  );

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ location, guests, maxPrice: String(maxPrice), limit: "50" });
    setLoading(true);
    apiRequest(`/accommodations?${query}`, { signal: controller.signal })
      .then((response) => {
        setApiListings(response.items);
        setNotice("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setApiListings(null);
          setNotice("The API is offline, so sample listings are shown for this preview.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [location, guests, maxPrice]);

  function toggleLike(id) {
    setLiked((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <main>
      <Header showSearch />
      <div className="search-layout">
        <section className="results-panel">
          <p className="eyebrow">{visibleListings.length}+ Airbnb Luxe stays in {location}</p>
          {notice && <p className="data-notice">{notice}</p>}
          <div className="filter-row">
            <button type="button">Free cancellation</button>
            <button type="button">Type of place</button>
            <label className="price-filter">Price ≤ ${maxPrice}<input type="range" min="100" max="400" step="25" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label>
            <button type="button">Instant Book</button>
            <button type="button">More filters</button>
          </div>
          <div className="listing-results">
            {loading && <p className="results-loading">Updating stays…</p>}
            {!loading && visibleListings.length === 0 && <div className="empty-results"><h2>No stays match these filters</h2><p>Try raising the price limit or searching another location.</p></div>}
            {visibleListings.map((listing) => (
              <article className="result-card" key={listing.id}>
                <Link to={`/listings/${listing.id}`} className="result-image"><img src={listing.searchImage} alt={listing.title} /></Link>
                <div className="result-body">
                  <div className="result-heading">
                    <div><span>{listing.type} in {location}</span><h2><Link to={`/listings/${listing.id}`}>{listing.title}</Link></h2></div>
                    <button className={`heart ${liked.has(listing.id) ? "liked" : ""}`} type="button" onClick={() => toggleLike(listing.id)} aria-label="Save listing">♡</button>
                  </div>
                  <div className="mini-rule" />
                  <p>{listing.guests} guests · {listing.type} · {listing.beds} beds · {listing.bathrooms} bath</p>
                  <p>{listing.amenities.slice(0, 3).join(" · ")}</p>
                  <div className="result-footer">
                    <span>★ {listing.rating} <small>({listing.reviews} reviews)</small></span>
                    <strong>${listing.price} <small>/night</small></strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="map-placeholder"><span>Map view</span></aside>
      </div>
    </main>
  );
}
