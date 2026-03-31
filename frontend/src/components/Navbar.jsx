import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/")
    ? "nav-link-active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🌿</span>
        <Link to="/" className="brand-text">NGO Connect</Link>
      </div>
      <div className="navbar-links">
        <Link to="/ngos" className={`nav-link ${isActive("/ngos")}`}>NGOs</Link>
        <Link to="/events" className={`nav-link ${isActive("/events")}`}>Events</Link>
        {user && (
          <Link to="/donate" className={`nav-link ${isActive("/donate")}`}>Donate</Link>
        )}
        {user ? (
          <>
            <Link to="/profile" className={`nav-btn-outline ${isActive("/profile")}`}>
              <span className="nav-avatar">{user.name.charAt(0).toUpperCase()}</span>
              {user.name.split(" ")[0]}
            </Link>
            {(user.role === "admin" || user.role === "ngo") && (
              <Link to="/dashboard" className={`nav-btn-outline ${isActive("/dashboard")}`}>
                {user.role === "admin" ? "⚙️ Admin" : "🏢 Dashboard"}
              </Link>
            )}
            {user.role === "user" && (
              <Link to="/dashboard" className={`nav-btn-outline ${isActive("/dashboard")}`}>
                📊 Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="nav-btn-danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn-outline">Login</Link>
            <Link to="/register" className="nav-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
