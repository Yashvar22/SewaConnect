import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
      ? "nav-link-active"
      : "";

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <span className="brand-icon">🌿</span>
        <Link to="/" className="brand-text" onClick={close}>
          SewaConnect
        </Link>
      </div>

      {/* Desktop Links */}
      <div className="navbar-links">
        <Link to="/ngos" className={`nav-link ${isActive("/ngos")}`}>NGOs</Link>
        <Link to="/events" className={`nav-link ${isActive("/events")}`}>Events</Link>
        {user && (
          <Link to="/donate" className={`nav-link ${isActive("/donate")}`}>Donate</Link>
        )}
        {user ? (
          <>
            <Link to="/dashboard" className={`nav-btn-outline ${isActive("/dashboard")}`}>
              {user.role === "admin" ? "⚙️ Admin" : user.role === "ngo" ? "🏢 Dashboard" : "📊 Dashboard"}
            </Link>
            <Link to="/profile" className={`nav-btn-outline ${isActive("/profile")}`}>
              <span className="nav-avatar">{user.name.charAt(0).toUpperCase()}</span>
              {user.name.split(" ")[0]}
            </Link>
            <button onClick={handleLogout} className="nav-btn-danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn-outline">Login</Link>
            <Link to="/register" className="nav-btn-primary">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={close}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="brand-icon">🌿</span>
              <span className="brand-text">SewaConnect</span>
              <button className="mobile-close" onClick={close}>✕</button>
            </div>
            {user && (
              <div className="mobile-user-info">
                <div className="nav-avatar" style={{ width: 36, height: 36, fontSize: "1rem" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
            )}
            <nav className="mobile-nav">
              <Link to="/" className={`mobile-nav-link ${isActive("/") && location.pathname === "/" ? "active" : ""}`} onClick={close}>🏠 Home</Link>
              <Link to="/ngos" className={`mobile-nav-link ${isActive("/ngos")}`} onClick={close}>🏢 NGOs</Link>
              <Link to="/events" className={`mobile-nav-link ${isActive("/events")}`} onClick={close}>📅 Events</Link>
              {user && (
                <>
                  <Link to="/donate" className={`mobile-nav-link ${isActive("/donate")}`} onClick={close}>💝 Donate</Link>
                  <Link to="/dashboard" className={`mobile-nav-link ${isActive("/dashboard")}`} onClick={close}>
                    {user.role === "admin" ? "⚙️ Admin Dashboard" : user.role === "ngo" ? "🏢 NGO Dashboard" : "📊 Dashboard"}
                  </Link>
                  <Link to="/profile" className={`mobile-nav-link ${isActive("/profile")}`} onClick={close}>👤 Profile</Link>
                  <button className="mobile-nav-link danger" onClick={handleLogout}>🚪 Logout</button>
                </>
              )}
              {!user && (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={close}>🔐 Login</Link>
                  <Link to="/register" className="mobile-nav-link primary" onClick={close}>✨ Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
