import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [volLoading, setVolLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 4000);
  };

  useEffect(() => {
    api.get(`/event/${id}`)
      .then(r => setEvent(r.data.event))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!event) return;
    if (user?.role === "ngo" || user?.role === "admin") {
      setVolLoading(true);
      api.get(`/volunteer/event/${id}`)
        .then(r => setVolunteers(r.data.volunteers || []))
        .catch(() => {})
        .finally(() => setVolLoading(false));
    }
  }, [event, user]);

  const handleApply = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/volunteer/apply", { userId: user._id, eventId: id });
      setApplied(true);
      flash("Application submitted! Status: Pending");
    } catch (err) {
      flash(err.response?.data?.message || "Error applying", true);
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

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return null;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Date TBD";

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {message && <div className="alert success">✅ {message}</div>}
      {error && <div className="alert error">⚠️ {error}</div>}

      {/* Event Header */}
      <div className="event-detail-header">
        <span className="event-date-chip">📅 {formattedDate}</span>
        <h1>{event.title}</h1>
        <p className="detail-desc">{event.description || "No description provided."}</p>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <span className="info-icon">🏢</span>
          <div>
            <small>Organized by</small>
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
        {event.ngoId?.location && (
          <div className="info-card">
            <span className="info-icon">📍</span>
            <div>
              <small>Location</small>
              <strong>{event.ngoId.location}</strong>
            </div>
          </div>
        )}
        <div className="info-card">
          <span className="info-icon">✅</span>
          <div>
            <small>NGO Status</small>
            <strong>{event.ngoId?.verified ? "Verified NGO" : "Pending"}</strong>
          </div>
        </div>
      </div>

      {/* Apply Button for regular users */}
      {user?.role === "user" && (
        <div className="apply-section">
          <h3>Interested in volunteering?</h3>
          <p>Click below to apply as a volunteer for this event.</p>
          <button
            className="btn-primary apply-btn"
            onClick={handleApply}
            disabled={applied}
          >
            {applied ? "✅ Application Submitted!" : "🙋 Apply as Volunteer"}
          </button>
        </div>
      )}
      {!user && (
        <div className="apply-section">
          <h3>Want to volunteer?</h3>
          <p>
            <Link to="/login">Login</Link> or <Link to="/register">register</Link> to apply as a volunteer.
          </p>
        </div>
      )}

      {/* Volunteer management for NGO/admin */}
      {(user?.role === "ngo" || user?.role === "admin") && (
        <div className="dashboard-section" style={{ marginTop: "2rem" }}>
          <h2>🙋 Volunteer Applications ({volunteers.length})</h2>
          {volLoading ? (
            <div className="loading">Loading volunteers...</div>
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
                        <span className={`badge ${v.status === "approved" ? "badge-green" : "badge-amber"}`}>
                          {v.status === "approved" ? "✅ Approved" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="table-actions">
                        {v.status !== "approved" && (
                          <button className="btn-approve" onClick={() => handleApproveVolunteer(v._id)}>
                            Approve
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

      {/* Link to NGO profile */}
      {event.ngoId?._id && (
        <div style={{ marginTop: "2rem" }}>
          <Link
            to={`/ngos/${event.ngoId._id}`}
            className="btn-primary"
            style={{ display: "inline-flex", width: "auto", padding: "0.7rem 1.5rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem" }}
          >
            🏢 View {event.ngoId.name}'s Full Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
