import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <div className="not-found-emoji">🌿</div>
      <h1 className="not-found-code">404</h1>
      <h2>Page Not Found</h2>
      <p>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="hero-buttons" style={{ justifyContent: "center", marginTop: "2rem" }}>
        <Link to="/" className="hero-btn-primary">
          🏠 Go Home
        </Link>
        <Link to="/ngos" className="hero-btn-ghost">
          Browse NGOs →
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
