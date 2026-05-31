import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";
import { getImageUrl } from "../utils/imageUrl";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [volLoading, setVolLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 4000);
  };

  // Load event details
  useEffect(() => {
    api.get(`/event/${id}`)
      .then(r => setEvent(r.data.event))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id]);

  // Load volunteer data for NGO/admin, and check if current user already applied
  useEffect(() => {
    if (!event) return;

    // For NGO/admin: load volunteer applications
    if (user?.role === "ngo" || user?.role === "admin") {
      setVolLoading(true);
      api.get(`/volunteer/event/${id}`)
        .then(r => setVolunteers(r.data.volunteers || []))
        .catch(() => {})
        .finally(() => setVolLoading(false));
    }

    // For regular user: check if they already applied
    if (user?.role === "user") {
      api.get("/volunteer/my")
        .then(r => {
          const apps = r.data.applications || [];
          const alreadyApplied = apps.some(a => a.eventId?._id === id || a.eventId === id);
          setApplied(alreadyApplied);
        })
        .catch(() => {});
    }
  }, [event, user, id]);

  const handleApply = async () => {
    if (!user) return navigate("/login");
    if (applying) return;
    setApplying(true);
    try {
      await api.post("/volunteer/apply", { eventId: id });
      setApplied(true);
      flash("🎉 Application submitted! Status: Pending");
    } catch (err) {
      flash(err.response?.data?.message || "Error applying", true);
    } finally {
      setApplying(false);
    }
  };

  const handleApproveVolunteer = async (appId) => {
    try {
      await api.put(`/volunteer/approve/${appId}`);
      setVolunteers(prev => prev.map(v => v._id === appId ? { ...v, status: "approved" } : v));
      flash("Volunteer approved ✅");
    } catch (err) {
      flash(err.response?.data?.message || "Error", true);
    }
  };

  const handleRejectVolunteer = async (appId) => {
    try {
      await api.put(`/volunteer/reject/${appId}`);
      setVolunteers(prev => prev.map(v => v._id === appId ? { ...v, status: "rejected" } : v));
      flash("Volunteer application rejected");
    } catch (err) {
      flash(err.response?.data?.message || "Error", true);
    }
  };

  if (loading) return (
    <div className="page">
      <div className="loading">
        <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
        Loading event details...
      </div>
    </div>
  );
  if (!event) return null;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date TBD";

  const approvedCount = volunteers.filter(v => v.status === "approved").length;
  const pendingCount = volunteers.filter(v => v.status === "pending").length;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {message && <div className="alert success">✅ {message}</div>}
      {error && <div className="alert error">⚠️ {error}</div>}

      {/* ── Event Header ── */}
      <div className="event-detail-header">
        <span className="event-date-chip">📅 {formattedDate}</span>
        <h1>{event.title}</h1>
        <p className="detail-desc">{event.description || "No description provided for this event."}</p>
      </div>

      {/* ── Info Cards ── */}
      <div className="info-cards">
        <div className="info-card">
          <span className="info-icon">🏢</span>
          <div>
            <small>Organised by</small>
            <Link to={`/ngos/${event.ngoId?._id}`} className="info-link">
              {event.ngoId?.name || "NGO"}
            </Link>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📅</span>
          <div>
            <small>Event Date</small>
            <strong>{formattedDate}</strong>
          </div>
        </div>
        {(event.location || event.ngoId?.location) && (
          <div className="info-card">
            <span className="info-icon">📍</span>
            <div>
              <small>Location</small>
              <strong>{event.location || event.ngoId?.location}</strong>
            </div>
          </div>
        )}
        <div className="info-card">
          <span className="info-icon">✅</span>
          <div>
            <small>NGO Status</small>
            <strong style={{ color: event.ngoId?.verified ? "var(--success)" : "var(--warning)" }}>
              {event.ngoId?.verified ? "✅ Verified NGO" : "⏳ Pending Verification"}
            </strong>
          </div>
        </div>
        {volunteers.length > 0 && (user?.role === "ngo" || user?.role === "admin") && (
          <>
            <div className="info-card">
              <span className="info-icon">👥</span>
              <div>
                <small>Total Applications</small>
                <strong>{volunteers.length}</strong>
              </div>
            </div>
            <div className="info-card">
              <span className="info-icon">✅</span>
              <div>
                <small>Approved / Pending</small>
                <strong>{approvedCount} / {pendingCount}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Location Map ── */}
      {(event.location || event.ngoId?.location) && (
        <div className="map-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <p className="map-section-title">🗺️ Event Location</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.ngoId?.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-open-link"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <MapView
            location={event.location || event.ngoId?.location}
            label={event.title}
            height="280px"
          />
        </div>
      )}

      {/* ── NGO Info Panel (shown to all) ── */}
      {event.ngoId && (
        <div className="donate-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>🏢 About the Organiser</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {event.ngoId.photo ? (
              <img
                src={getImageUrl(event.ngoId.photo)}
                alt={event.ngoId.name}
                style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div className="ngo-avatar" style={{ width: 64, height: 64, fontSize: "1.5rem", flexShrink: 0, borderRadius: 12 }}>
                {event.ngoId.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                <strong style={{ fontSize: "1rem" }}>{event.ngoId.name}</strong>
                {event.ngoId.verified && <span className="badge badge-green">✅ Verified</span>}
              </div>
              {event.ngoId.description && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.55, margin: "0 0 0.4rem" }}>
                  {event.ngoId.description}
                </p>
              )}
              {event.ngoId.location && (
                <span className="location-tag" style={{ fontSize: "0.8rem" }}>📍 {event.ngoId.location}</span>
              )}
              <div style={{ marginTop: "0.6rem" }}>
                <Link
                  to={`/ngos/${event.ngoId._id}`}
                  className="chip"
                  style={{ textDecoration: "none", display: "inline-block" }}
                >
                  View NGO Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Apply Section (regular users) ── */}
      {user?.role === "user" && (
        <div className="apply-section">
          <h3>🙋 Interested in Volunteering?</h3>
          <p>Click below to apply as a volunteer for this event. The NGO will review your application.</p>
          <button
            id="apply-volunteer-btn"
            className="btn-primary apply-btn"
            onClick={handleApply}
            disabled={applied || applying}
            style={{ opacity: applied ? 0.8 : 1 }}
          >
            {applying ? "⏳ Submitting..." : applied ? "✅ Application Submitted — Pending Review" : "🙋 Apply as Volunteer"}
          </button>
          {applied && (
            <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              You can track your application status in your <Link to="/dashboard" style={{ color: "var(--primary)" }}>Dashboard</Link> or <Link to="/profile" style={{ color: "var(--primary)" }}>Profile</Link>.
            </p>
          )}
        </div>
      )}

      {/* ── Login prompt (not logged in) ── */}
      {!user && (
        <div className="apply-section">
          <h3>🙋 Want to Volunteer?</h3>
          <p>
            <Link to="/login">Login</Link> or <Link to="/register">register</Link> as a volunteer to apply for this event.
          </p>
          <Link
            to="/login"
            className="btn-primary apply-btn"
            style={{ display: "inline-flex", maxWidth: 280, textDecoration: "none", justifyContent: "center" }}
          >
            🔑 Login to Apply
          </Link>
        </div>
      )}

      {/* ── NGO role info ── */}
      {user?.role === "ngo" && (
        <div className="apply-section" style={{ background: "var(--bg3)" }}>
          <h3>🏢 NGO View</h3>
          <p>You are viewing this event as an NGO. Manage volunteer applications below.</p>
        </div>
      )}

      {/* ── Volunteer management for NGO/admin ── */}
      {(user?.role === "ngo" || user?.role === "admin") && (
        <div className="dashboard-section" style={{ marginTop: "2rem" }}>
          <h2>🙋 Volunteer Applications ({volunteers.length})</h2>
          {volLoading ? (
            <div className="loading">
              <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
              Loading volunteers...
            </div>
          ) : volunteers.length === 0 ? (
            <div className="empty-state" style={{ padding: "2.5rem" }}>
              <span>👥</span>
              <h3>No applications yet</h3>
              <p>Volunteers will appear here once they apply.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v._id}>
                      <td><strong>{v.userId?.name || "—"}</strong></td>
                      <td>{v.userId?.email || "—"}</td>
                      <td>
                        {new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span className={`badge ${v.status === "approved" ? "badge-green" : v.status === "rejected" ? "badge-red" : "badge-amber"}`}>
                          {v.status === "approved" ? "✅ Approved" : v.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="table-actions">
                        {v.status !== "approved" && (
                          <button className="btn-approve" onClick={() => handleApproveVolunteer(v._id)}>
                            Approve
                          </button>
                        )}
                        {v.status !== "rejected" && (
                          <button className="btn-danger-xs" onClick={() => handleRejectVolunteer(v._id)}>
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Link back to NGO profile ── */}
      {event.ngoId?._id && (
        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            to={`/ngos/${event.ngoId._id}`}
            className="btn-primary"
            style={{ display: "inline-flex", width: "auto", padding: "0.7rem 1.5rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem" }}
          >
            🏢 View {event.ngoId.name}'s Full Profile
          </Link>
          <Link
            to="/events"
            className="btn-sm"
            style={{ display: "inline-flex", width: "auto", padding: "0.7rem 1.5rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem" }}
          >
            ← Browse All Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
