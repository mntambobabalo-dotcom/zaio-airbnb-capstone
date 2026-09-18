import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../data/assets";

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

export default function SearchBar({ compact = false, initialLocation = "Bordeaux" }) {
  const navigate = useNavigate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 8);

  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(toInputDate(tomorrow));
  const [checkOut, setCheckOut] = useState(toInputDate(nextWeek));
  const [guests, setGuests] = useState(2);

  function submit(event) {
    event.preventDefault();
    const query = new URLSearchParams({ location, checkIn, checkOut, guests });
    navigate(`/search?${query.toString()}`);
  }

  return (
    <form className={`search-bar ${compact ? "search-bar--compact" : ""}`} onSubmit={submit}>
      <label className="search-field search-field--location">
        <span>Location</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Location" required />
      </label>
      {!compact && (
        <>
          <label className="search-field">
            <span>Check in</span>
            <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required />
          </label>
          <label className="search-field">
            <span>Check out</span>
            <input type="date" min={checkIn} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required />
          </label>
          <label className="search-field">
            <span>Guests</span>
            <select value={guests} onChange={(event) => setGuests(event.target.value)}>
              {[1, 2, 3, 4, 5, 6].map((amount) => <option key={amount} value={amount}>{amount} guest{amount > 1 ? "s" : ""}</option>)}
            </select>
          </label>
        </>
      )}
      <button className="search-submit" type="submit" aria-label="Search stays">
        <img src={assets.search} alt="" />
      </button>
    </form>
  );
}
