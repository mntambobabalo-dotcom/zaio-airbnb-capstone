import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <NavLink className="admin-brand" to="/admin/listings">airbnb <span>Host admin</span></NavLink>
        <div><span>{user.username}</span><button type="button" onClick={signOut}>Log out</button></div>
      </header>
      <aside className="admin-sidebar">
        <nav aria-label="Admin navigation">
          <NavLink to="/admin/listings">Listings</NavLink>
          <NavLink to="/admin/listings/new">Create listing</NavLink>
          <NavLink to="/admin/reservations">Reservations</NavLink>
          <NavLink to="/">View website</NavLink>
        </nav>
      </aside>
      <section className="admin-content"><Outlet /></section>
    </div>
  );
}
