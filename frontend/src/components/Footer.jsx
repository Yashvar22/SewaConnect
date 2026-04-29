import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <span>🌿</span>
        <span className="footer-brand-text">SewaConnect</span>
        <p>Bridging NGOs, volunteers, and donors to create lasting social impact across India.</p>
        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem" }}>
          {["🌐", "📘", "🐦", "📸"].map((icon, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", transition: "border-color 0.2s" }}>
              {icon}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/ngos">Browse NGOs</Link>
          <Link to="/events">Upcoming Events</Link>
          <Link to="/donate">Make a Donation</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/register">Register Free</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/dashboard">My Dashboard</Link>
        </div>
        <div className="footer-col">
          <h4>About</h4>
          <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", lineHeight: 1.7 }}>
            SewaConnect is a MERN stack platform connecting verified NGOs with passionate volunteers
            and generous donors. Built as a capstone project for real-world social impact.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
            <span style={{ width: 8, height: 8, background: "var(--primary)", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px var(--primary)" }} />
            <small style={{ color: "var(--primary)", fontSize: "0.77rem", fontWeight: 600 }}>All systems operational</small>
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} SewaConnect — Built with 💚 for social good. Made in India 🇮🇳</p>
    </div>
  </footer>
);

export default Footer;
