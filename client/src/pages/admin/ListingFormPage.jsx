import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

const emptyForm = {
  title: "",
  location: "",
  description: "",
  type: "Entire home",
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  price: 100,
  weeklyDiscount: 0,
  cleaningFee: 0,
  serviceFee: 0,
  occupancyTaxes: 0,
  amenities: "Wifi, Kitchen",
  images: "",
  enhancedCleaning: true,
  selfCheckIn: true,
};

const numericFields = ["guests", "bedrooms", "beds", "bathrooms", "price", "weeklyDiscount", "cleaningFee", "serviceFee", "occupancyTaxes"];

export default function ListingFormPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const editing = Boolean(listingId);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();
    apiRequest(`/accommodations/${listingId}`, { signal: controller.signal })
      .then((listing) => setForm({
        ...emptyForm,
        ...Object.fromEntries(Object.keys(emptyForm).map((key) => [key, listing[key] ?? emptyForm[key]])),
        amenities: (listing.amenities ?? []).join(", "),
        images: (listing.images ?? []).join("\n"),
      }))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [editing, listingId]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      ...form,
      ...Object.fromEntries(numericFields.map((field) => [field, Number(form[field])])),
      amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
      images: form.images.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
    };

    try {
      await apiRequest(editing ? `/accommodations/${listingId}` : "/accommodations", {
        method: editing ? "PUT" : "POST",
        body: payload,
        token,
      });
      navigate("/admin/listings", { replace: true, state: { notice: editing ? "Listing updated successfully." : "Listing created successfully." } });
    } catch (requestError) {
      setError(requestError.details?.join(" ") ?? requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading listing…</p>;

  return (
    <div>
      <div className="admin-page-heading"><div><p>Property management</p><h1>{editing ? "Edit listing" : "Create a listing"}</h1></div><Link to="/admin/listings">Cancel</Link></div>
      {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
      <form className="listing-form" onSubmit={submit}>
        <section><h2>Basic information</h2><div className="form-grid">
          <label className="span-two"><span>Title</span><input name="title" value={form.title} onChange={updateField} required maxLength="120" /></label>
          <label><span>Location</span><input name="location" value={form.location} onChange={updateField} required /></label>
          <label><span>Property type</span><select name="type" value={form.type} onChange={updateField}>{["Entire home", "Private room", "Shared room", "Hotel room"].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="span-two"><span>Description</span><textarea name="description" value={form.description} onChange={updateField} rows="5" required maxLength="3000" /></label>
        </div></section>
        <section><h2>Rooms and capacity</h2><div className="form-grid form-grid--four">
          {[["guests", "Guests"], ["bedrooms", "Bedrooms"], ["beds", "Beds"], ["bathrooms", "Bathrooms"]].map(([name, label]) => <label key={name}><span>{label}</span><input type="number" name={name} value={form[name]} onChange={updateField} min={name === "guests" ? 1 : 0} required /></label>)}
        </div></section>
        <section><h2>Pricing</h2><div className="form-grid form-grid--five">
          {[["price", "Nightly price ($)"], ["weeklyDiscount", "Weekly discount (%)"], ["cleaningFee", "Cleaning fee ($)"], ["serviceFee", "Service fee ($)"], ["occupancyTaxes", "Taxes ($)"]].map(([name, label]) => <label key={name}><span>{label}</span><input type="number" name={name} value={form[name]} onChange={updateField} min="0" max={name === "weeklyDiscount" ? 100 : undefined} required /></label>)}
        </div></section>
        <section><h2>Amenities and photos</h2><div className="form-grid">
          <label className="span-two"><span>Amenities (comma separated)</span><textarea name="amenities" value={form.amenities} onChange={updateField} rows="3" /></label>
          <label className="span-two"><span>Image URLs (one per line)</span><textarea name="images" value={form.images} onChange={updateField} rows="5" placeholder="https://images.example.com/photo.jpg" /></label>
          <label className="checkbox-label"><input type="checkbox" name="enhancedCleaning" checked={form.enhancedCleaning} onChange={updateField} /> Enhanced cleaning</label>
          <label className="checkbox-label"><input type="checkbox" name="selfCheckIn" checked={form.selfCheckIn} onChange={updateField} /> Self check-in</label>
        </div></section>
        <div className="form-actions"><Link to="/admin/listings">Cancel</Link><button className="admin-primary-button" disabled={submitting} type="submit">{submitting ? "Saving…" : editing ? "Save changes" : "Create listing"}</button></div>
      </form>
    </div>
  );
}
