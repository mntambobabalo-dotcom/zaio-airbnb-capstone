import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../data/assets";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

export default function Header({ home = false, showSearch = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function closeDropdown(event) {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <header className={`site-header ${home ? "site-header--home" : ""}`}>
      <Link to="/" className="brand" aria-label="Airbnb clone home">
        <img src={home ? assets.logoLight : assets.logoDark} alt="Airbnb" />
      </Link>

      {home ? (
        <nav className="main-nav" aria-label="Main navigation">
          <a className="active" href="#stays">Places to stay</a>
          <a href="#experiences">Experiences</a>
          <a href="#experiences">Online Experiences</a>
        </nav>
      ) : showSearch ? (
        <div className="header-search"><SearchBar compact /></div>
      ) : <span />}

      <div className="header-actions">
        {user?.role === "host" || user?.role === "admin" ? <Link className="host-link" to="/admin/listings">Host dashboard</Link> : <span className="host-link">Become a Host</span>}
        <img className="header-icon" src={home ? assets.globeLight : assets.globeDark} alt="Language" />
        <div className="profile-wrap" ref={dropdownRef}>
          <button className="profile-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            <img src={assets.menu} alt="Menu" />
            <img src={assets.avatar} alt="Profile" />
          </button>
          {open && (
            <div className="profile-menu">
              <Link to="/reservations">My reservations</Link>
              {user?.role === "host" || user?.role === "admin" ? <Link to="/admin/listings">Manage listings</Link> : null}
              {user ? <button type="button" onClick={logout}>Log out {user.username}</button> : <Link to="/login">Log in</Link>}
              {!user && <Link to="/login">Sign up</Link>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
