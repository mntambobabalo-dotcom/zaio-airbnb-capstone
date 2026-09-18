import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ListingPage from "./pages/ListingPage";
import LoginPage from "./pages/LoginPage";
import ReservationsPage from "./pages/ReservationsPage";
import SearchPage from "./pages/SearchPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";
import AdminReservationsPage from "./pages/admin/AdminReservationsPage";
import ListingFormPage from "./pages/admin/ListingFormPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/listings/:listingId" element={<ListingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["host", "admin"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="listings" replace />} />
        <Route path="listings" element={<AdminListingsPage />} />
        <Route path="listings/new" element={<ListingFormPage />} />
        <Route path="listings/:listingId/edit" element={<ListingFormPage />} />
        <Route path="reservations" element={<AdminReservationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
