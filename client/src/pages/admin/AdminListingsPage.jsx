import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function AdminListingsPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice ?? "");

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/accommodations/host/mine", { token, signal: controller.signal })
      .then(setListings)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [token]);

  async function removeListing(listing) {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    setError("");
    try {
      await apiRequest(`/accommodations/${listing._id}`, { method: "DELETE", token });
      setListings((current) => current.filter((item) => item._id !== listing._id));
      setNotice("Listing deleted successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <div className="admin-page-heading"><div><p>Property management</p><h1>Listings</h1></div><Link className="admin-primary-button" to="/admin/listings/new">Create listing</Link></div>
      {notice && <p className="admin-alert admin-alert--success">{notice}</p>}
      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {loading ? <p>Loading listings…</p> : listings.length === 0 ? (
        <div className="admin-empty"><h2>No listings yet</h2><p>Create your first property to make it available on the public website.</p><Link to="/admin/listings/new">Create listing</Link></div>
      ) : (
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Listing</th><th>Location</th><th>Capacity</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead><tbody>
          {listings.map((listing) => <tr key={listing._id}>
            <td><div className="listing-cell">{listing.images?.[0] ? <img src={listing.images[0]} alt="" /> : <span className="listing-thumb-placeholder" />}<strong>{listing.title}</strong></div></td>
            <td>{listing.location}</td><td>{listing.guests} guests</td><td>${listing.price}/night</td><td>★ {listing.rating || "New"}</td>
            <td><div className="table-actions"><Link to={`/admin/listings/${listing._id}/edit`}>Edit</Link><button type="button" onClick={() => removeListing(listing)}>Delete</button></div></td>
          </tr>)}
        </tbody></table></div>
      )}
    </div>
  );
}
