import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";
import RazorpayDonationModal from "../components/RazorpayDonationModal";
import { getImageUrl } from "../utils/imageUrl";

const NGODetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/ngo/${id}`),
      api.get(`/event/ngo/${id}`),
      api.get(`/ngo/${id}/stats`),
    ]).then(([ngoRes, evRes, statsRes]) => {
      setNgo(ngoRes.data.ngo);
      setEvents(evRes.data.events);
      setStats(statsRes.data);
    }).catch(() => navigate("/ngos"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading NGO...</div>;
  if (!ngo) return null;

  const statusBadge = ngo.verified
    ? <span className="badge badge-green">✅ Verified</span>
    : ngo.rejected
      ? <span className="badge badge-red">❌ Rejected</span>
      : <span className="badge badge-amber">⏳ Pending</span>;

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="page">
      {/* Razorpay modal — launched directly from this page */}
      {showDonateModal && user && (
        <RazorpayDonationModal
          ngoId={ngo._id}
          ngoName={ngo.name}
          onClose={() => setShowDonateModal(false)}
          onSuccess={() => {}}
        />
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>← Back to NGOs</button>

      {/* NGO Hero */}
      <div className="detail-hero">
        <div className="detail-avatar-wrap">
          {ngo.photo
            ? <img src={getImageUrl(ngo.photo)} alt={ngo.name} className="detail-avatar-img" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 18 }} />
            : <div className="ngo-avatar lg">{ngo.name.charAt(0).toUpperCase()}</div>}
        </div>
        <div className="detail-info" style={{ flex: 1 }}>
          <h1>{ngo.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {statusBadge}
            {ngo.location && <span className="location-tag">📍 {ngo.location}</span>}
            {ngo.category && (
              <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                🏷️ {ngo.category}
              </span>
            )}
          </div>
          <p className="detail-desc">{ngo.description || "No description provided."}</p>
          {/* Contact & Website */}
          <div className="ngo-meta-row">
            {ngo.contact && (
              <span className="ngo-meta-chip">
                📞 <span>{ngo.contact}</span>
              </span>
            )}
            {ngo.website && (
              <span className="ngo-meta-chip">
                🌐 <a href={ngo.website.startsWith("http") ? ngo.website : `https://${ngo.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                  {ngo.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
          </div>
          <p className="card-meta" style={{ marginTop: "0.75rem" }}>
            Registered by <strong>{ngo.createdBy?.name}</strong>
          </p>
        </div>
        {/* Quick actions */}
        {user?.role === "user" && ngo.verified && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flexShrink: 0 }}>
            <button
              id="ngo-donate-btn"
              className="btn-primary"
              style={{ display: "inline-flex", width: "auto", padding: "0.7rem 1.5rem", borderRadius: "8px", gap: "0.4rem", whiteSpace: "nowrap", cursor: "pointer" }}
              onClick={() => setShowDonateModal(true)}
            >
              💝 Donate to this NGO
            </button>
          </div>
        )}
        {/* Link for non-logged-in users */}
        {!user && ngo.verified && (
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/login"
              className="btn-primary"
              style={{ display: "inline-flex", width: "auto", padding: "0.7rem 1.5rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem" }}
            >
              💝 Login to Donate
            </Link>
          </div>
        )}
      </div>

      {/* Location Map */}
      {ngo.location && (
        <div className="map-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <p className="map-section-title">🗺️ Location Map</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-open-link"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <MapView location={ngo.location} label={ngo.name} height="280px" />
        </div>
      )}

      {/* Stats Bar */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          <div className="stat-card green">
            <span className="stat-card-num">{stats.eventCount}</span>
            <span>Events Created</span>
          </div>
          <div className="stat-card blue">
            <span className="stat-card-num">{stats.volunteerCount}</span>
            <span>Volunteers</span>
          </div>
          <div className="stat-card purple">
            <span className="stat-card-num">{stats.donationCount}</span>
            <span>Donations</span>
          </div>
        </div>
      )}

      {/* Events by this NGO */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>📅 Events by {ngo.name}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {events.length} event{events.length !== 1 ? "s" : ""} organized
            </p>
          </div>
          <Link to="/events" className="view-all-link">All Events →</Link>
        </div>

        {events.length === 0 ? (
          <div className="empty-state" style={{ padding: "3rem 2rem" }}>
            <span>📭</span>
            <h3>No events yet</h3>
            <p>This NGO hasn't created any events yet. Check back later!</p>
          </div>
        ) : (
          <div className="card-grid">
            {events.map(ev => (
              <Link to={`/events/${ev._id}`} key={ev._id} className="card event-card link-card">
                <div className="event-date">
                  {ev.date ? formatDate(ev.date) : "Date TBD"}
                </div>
                <div className="card-title">{ev.title}</div>
                <p>{ev.description
                  ? ev.description.length > 100 ? ev.description.slice(0, 100) + "..." : ev.description
                  : "Click to see event details."}</p>
                <div className="card-footer">
                  <span className="card-meta">📍 {ngo.location || "Location TBD"}</span>
                  <span className="chip">Apply →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Donate CTA */}
      {user?.role === "user" && ngo.verified && (
        <div className="apply-section" style={{ marginTop: "0" }}>
          <h3>Support {ngo.name}</h3>
          <p>Make a secure online donation to help this NGO continue their impactful work.</p>
          <button
            className="btn-primary"
            style={{ display: "inline-flex", width: "auto", padding: "0.85rem 2.5rem", borderRadius: "8px", gap: "0.5rem", cursor: "pointer" }}
            onClick={() => setShowDonateModal(true)}
          >
            💝 Donate Now via Razorpay
          </button>
        </div>
      )}
    </div>
  );
};

export default NGODetailPage;
