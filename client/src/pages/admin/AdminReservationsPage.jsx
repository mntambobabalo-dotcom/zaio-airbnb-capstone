import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(date));
}

export default function AdminReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/reservations/host", { token, signal: controller.signal })
      .then(setReservations)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [token]);

  async function removeReservation(id) {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await apiRequest(`/reservations/${id}`, { method: "DELETE", token });
      setReservations((current) => current.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <div className="admin-page-heading"><div><p>Booking management</p><h1>Reservations</h1></div><span>{reservations.length} total</span></div>
      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {loading ? <p>Loading reservations…</p> : reservations.length === 0 ? <div className="admin-empty"><h2>No reservations yet</h2><p>New bookings for your properties will appear here.</p></div> : (
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Guest</th><th>Listing</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Action</th></tr></thead><tbody>
          {reservations.map((reservation) => <tr key={reservation._id}><td><strong>{reservation.user?.username}</strong><small>{reservation.user?.email}</small></td><td>{reservation.accommodation?.title}</td><td>{formatDate(reservation.checkIn)}</td><td>{formatDate(reservation.checkOut)}</td><td>{reservation.guests}</td><td>${reservation.total}</td><td><button className="text-danger" type="button" onClick={() => removeReservation(reservation._id)}>Delete</button></td></tr>)}
        </tbody></table></div>
      )}
    </div>
  );
}
