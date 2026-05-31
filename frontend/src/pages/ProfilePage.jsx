import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

const ProfilePage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("donations");

  useEffect(() => {
    Promise.all([
      api.get("/donation/my"),
      api.get("/volunteer/my"),
    ]).then(([donRes, volRes]) => {
      setDonations(donRes.data.donations || []);
      setApplications(volRes.data.applications || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const roleLabel = { admin: "👨‍💼 Admin", ngo: "🏢 NGO Manager", user: "🙋 Volunteer" }[user?.role] || "User";
  const roleColor = { admin: "#f59e0b", ngo: "#10b981", user: "#6366f1" }[user?.role] || "#6366f1";

  const totalMoneyDonated = donations
    .filter(d => d.type === "money")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const approvedEvents = applications.filter(a => a.status === "approved").length;

  return (
    <div className="page">
      {/* ── PROFILE HEADER ── */}
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <h1>{user?.name}</h1>
          <p className="profile-email">📧 {user?.email}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <span className="role-badge" style={{ background: roleColor }}>{roleLabel}</span>
            <p className="profile-since">
              Member since {user?.createdAt ? formatDate(user.createdAt) : "—"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <Link
            to="/donate"
            className="btn-primary"
            style={{ display: "inline-flex", width: "auto", padding: "0.65rem 1.3rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem", fontSize: "0.875rem" }}
          >
            💝 Donate
          </Link>
          <Link
            to="/events"
            className="btn-sm"
            style={{ display: "inline-flex", width: "auto", padding: "0.65rem 1.3rem", textDecoration: "none", borderRadius: "8px", gap: "0.4rem", fontSize: "0.875rem" }}
          >
            📅 Find Events
          </Link>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-value">{donations.length}</span>
          <span className="stat-label">Total Donations</span>
        </div>
        <div className="profile-stat">
          <span className="stat-value">{applications.length}</span>
          <span className="stat-label">Events Applied</span>
        </div>
        <div className="profile-stat">
          <span className="stat-value">{approvedEvents}</span>
          <span className="stat-label">Approved</span>
        </div>
        {totalMoneyDonated > 0 && (
          <div className="profile-stat">
            <span className="stat-value">₹{totalMoneyDonated.toLocaleString()}</span>
            <span className="stat-label">Money Donated</span>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "donations" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          📦 Donations ({donations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "events" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          📅 Event Applications ({applications.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your activity...</div>
      ) : (
        <>
          {/* ── DONATIONS TAB ── */}
          {activeTab === "donations" && (
            <div className="tab-content">
              {donations.length === 0 ? (
                <div className="empty-state">
                  <span>📭</span>
                  <h3>No donations yet</h3>
                  <p>Start making a difference! <Link to="/donate">Make your first donation →</Link></p>
                </div>
              ) : (
                <div className="activity-list">
                  {donations.map(d => (
                    <div key={d._id} className="activity-item">
                      <div className="activity-icon">
                        {d.type === "money" ? "💵" : "📦"}
                      </div>
                      <div className="activity-details">
                        <strong>{d.type === "money" ? `₹${d.amount} Money Donation` : d.itemName}</strong>
                        {d.description && <p>{d.description}</p>}
                        {d.ngoId && <span className="activity-tag">🏢 {d.ngoId.name}</span>}
                        {d.type === "item" && d.pickupOption && (
                          <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                            {d.pickupOption === "pickup" ? "🚗 NGO picks up" : "🏬 Self drop-off"}
                            {d.pickupAddress && ` • ${d.pickupAddress}`}
                          </p>
                        )}
                      </div>
                      <div className="activity-meta">
                        <span className={`badge ${d.type === "money" ? "badge-green" : "badge-blue"}`}>
                          {d.type === "money" ? "Money" : "Item"}
                        </span>
                        {d.type === "item" && d.image && (
                          <img
                            src={getImageUrl(d.image)}
                            alt="item"
                            className="activity-img"
                          />
                        )}
                        <small className="activity-date">{formatDate(d.createdAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "1.5rem" }}>
                <Link
                  to="/donate"
                  className="btn-primary"
                  style={{ display: "inline-flex", textDecoration: "none", padding: "0.7rem 1.5rem", borderRadius: "8px", width: "auto" }}
                >
                  + Make New Donation
                </Link>
              </div>
            </div>
          )}

          {/* ── EVENTS TAB ── */}
          {activeTab === "events" && (
            <div className="tab-content">
              {applications.length === 0 ? (
                <div className="empty-state">
                  <span>📭</span>
                  <h3>No applications yet</h3>
                  <p>Browse events and apply as a volunteer! <Link to="/events">See Events →</Link></p>
                </div>
              ) : (
                <div className="activity-list">
                  {applications.map(app => (
                    <div key={app._id} className="activity-item">
                      <div className="activity-icon">📅</div>
                      <div className="activity-details">
                        <strong>
                          <Link to={`/events/${app.eventId?._id}`} className="activity-link">
                            {app.eventId?.title || "Event"}
                          </Link>
                        </strong>
                        {app.eventId?.date && (
                          <p>📅 {formatDate(app.eventId.date)}</p>
                        )}
                        {app.eventId?.ngoId && (
                          <span className="activity-tag">
                            <Link to={`/ngos/${app.eventId.ngoId._id}`} className="activity-tag" style={{ textDecoration: "none" }}>
                              🏢 {app.eventId.ngoId.name}
                            </Link>
                          </span>
                        )}
                      </div>
                      <div className="activity-meta">
                        <span className={`badge ${
                          app.status === "approved" ? "badge-green" :
                          app.status === "rejected" ? "badge-red" : "badge-amber"
                        }`}>
                          {app.status === "approved" ? "✅ Approved" :
                           app.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                        </span>
                        <small className="activity-date">{formatDate(app.createdAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "1.5rem" }}>
                <Link
                  to="/events"
                  className="btn-primary"
                  style={{ display: "inline-flex", textDecoration: "none", padding: "0.7rem 1.5rem", borderRadius: "8px", width: "auto" }}
                >
                  Browse More Events
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
