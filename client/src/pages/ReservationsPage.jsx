import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(value));
}

export default function ReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/reservations/user", { token, signal: controller.signal })
      .then(setReservations)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [token]);

  async function removeReservation(id) {
    if (!window.confirm("Cancel and delete this reservation?")) return;
    setError("");
    try {
      await apiRequest(`/reservations/${id}`, { method: "DELETE", token });
      setReservations((current) => current.filter((reservation) => reservation._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main>
      <Header />
      <section className="reservations-page page-shell">
        <h1>My reservations</h1>
        {error && <p className="admin-alert admin-alert--error">{error}</p>}
        {loading ? <p>Loading your trips…</p> : reservations.length === 0 ? <div className="empty-state"><h2>No trips booked yet</h2><p>When you reserve a stay, it will appear here.</p><Link className="dark-button" to="/search">Explore stays</Link></div> : (
          <div className="table-wrap"><table><thead><tr><th>Property</th><th>Check-in</th><th>Checkout</th><th>Guests</th><th>Total</th><th>Action</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation._id}><td>{reservation.accommodation?.title}</td><td>{formatDate(reservation.checkIn)}</td><td>{formatDate(reservation.checkOut)}</td><td>{reservation.guests}</td><td>${reservation.total}</td><td><button type="button" onClick={() => removeReservation(reservation._id)}>Cancel</button></td></tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
}
