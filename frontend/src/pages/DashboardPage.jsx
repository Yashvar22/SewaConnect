import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import RazorpayDonationModal from "../components/RazorpayDonationModal";
import { NGOCategoryChart, DonationTrendChart, NGOStatusChart, VolunteersPerEventChart } from "../components/DashboardCharts";
import { getImageUrl } from "../utils/imageUrl";

// ─── USER ACTIVITY MODAL ────────────────────────────────────────
const UserActivityModal = ({ userId, userName, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${userId}/activity`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 {userName} — Full Activity</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div className="loading" style={{ padding: "2rem" }}>
            <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
            Loading activity...
          </div>
        ) : !data ? (
          <p className="empty">Could not load activity</p>
        ) : (
          <>
            {/* User Info */}
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
                <div><span style={{ color: "var(--text-dim)" }}>🙋 Name:</span> <strong>{data.user?.name}</strong></div>
                <div><span style={{ color: "var(--text-dim)" }}>📧 Email:</span> <strong>{data.user?.email}</strong></div>
                <div><span style={{ color: "var(--text-dim)" }}>🏷️ Role:</span>
                  <span className={`badge ${data.user?.role === "admin" ? "badge-amber" : data.user?.role === "ngo" ? "badge-green" : "badge-blue"}`} style={{ marginLeft: 4 }}>
                    {data.user?.role}
                  </span>
                </div>
                <div><span style={{ color: "var(--text-dim)" }}>📅 Joined:</span> <strong>{data.user?.createdAt ? formatDate(data.user.createdAt) : "—"}</strong></div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <div className="stat-card blue"><span className="stat-card-num">{data.donations?.length || 0}</span><span>Donations</span></div>
              <div className="stat-card green"><span className="stat-card-num">{data.applications?.length || 0}</span><span>Applied</span></div>
              <div className="stat-card purple"><span className="stat-card-num">{data.donations?.filter(d => d.type === "money").length || 0}</span><span>💵 Money</span></div>
              <div className="stat-card amber"><span className="stat-card-num">{data.applications?.filter(a => a.status === "approved").length || 0}</span><span>✅ Approved</span></div>
            </div>

            <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>💝 Donation History</h3>
            {data.donations?.length === 0 ? (
              <p className="empty" style={{ marginBottom: "1.25rem" }}>No donations yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {data.donations.map(d => (
                  <div key={d._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--bg3)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{d.type === "money" ? "💵" : "📦"}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--text)" }}>{d.type === "money" ? `₹${d.amount}` : d.itemName}</strong>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                        {d.ngoId && <small style={{ color: "var(--text-muted)" }}>🏢 {d.ngoId.name}</small>}
                        {d.quantity && <small style={{ color: "var(--text-dim)" }}>Qty: {d.quantity}</small>}
                        {d.message && <small style={{ color: "var(--text-dim)", fontStyle: "italic" }}>"{d.message}"</small>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <small style={{ color: "var(--text-dim)" }}>{formatDate(d.createdAt)}</small>
                      <div>
                        {d.type === "money"
                          ? <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>💵 Money</span>
                          : <span className="badge badge-amber" style={{ fontSize: "0.65rem" }}>📦 Item</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>📅 Event Volunteer Applications</h3>
            {data.applications?.length === 0 ? (
              <p className="empty">No applications yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {data.applications.map(app => (
                  <div key={app._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--bg3)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>📅</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--text)" }}>{app.eventId?.title || "Event"}</strong>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                        {app.eventId?.ngoId && <small style={{ color: "var(--text-muted)" }}>🏢 {app.eventId.ngoId.name}</small>}
                        {app.eventId?.date && <small style={{ color: "var(--text-dim)" }}>📅 {formatDate(app.eventId.date)}</small>}
                      </div>
                    </div>
                    <span className={`badge ${app.status === "approved" ? "badge-green" : app.status === "rejected" ? "badge-red" : "badge-amber"}`}>
                      {app.status === "approved" ? "✅ Approved" : app.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── NGO DETAIL MODAL (Admin verification view) ─────────────────
const NGODetailModal = ({ ngo, onClose, onVerify, onReject }) => {
  const [isBusy, setIsBusy] = useState(false);
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const handleAction = async (actionFn, id) => {
    setIsBusy(true);
    await actionFn(id);
    setIsBusy(false);
  };

  if (!ngo) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏢 NGO Details — Admin Review</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Header: photo + name + status */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {ngo.photo ? (
            <img src={getImageUrl(ngo.photo)} alt={ngo.name}
              style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }} />
          ) : (
            <div className="ngo-avatar lg" style={{ width: 80, height: 80, fontSize: "2rem", borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {ngo.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.2rem" }}>{ngo.name}</h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {ngo.verified
                ? <span className="badge badge-green">✅ Verified</span>
                : ngo.rejected
                ? <span className="badge badge-red">❌ Rejected</span>
                : <span className="badge badge-amber">⏳ Pending Verification</span>}
              {ngo.category && <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>🏷️ {ngo.category}</span>}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
              {ngo.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            { label: "📍 Location", value: ngo.location || "—" },
            { label: "📞 Contact", value: ngo.contact || "—" },
            { label: "🏷️ Category", value: ngo.category || "other", caps: true },
            { label: "📅 Registered On", value: ngo.createdAt ? formatDate(ngo.createdAt) : "—" },
          ].map(item => (
            <div key={item.label} style={{ background: "var(--bg3)", borderRadius: 10, padding: "0.75rem 1rem", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>{item.label}</div>
              <strong style={{ fontSize: "0.9rem", textTransform: item.caps ? "capitalize" : "none" }}>{item.value}</strong>
            </div>
          ))}
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "0.75rem 1rem", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>👤 Registered By</div>
            <strong style={{ fontSize: "0.9rem" }}>{ngo.createdBy?.name || "—"}</strong>
            {ngo.createdBy?.email && <small style={{ display: "block", color: "var(--text-muted)", marginTop: "0.1rem" }}>{ngo.createdBy.email}</small>}
          </div>
          <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "0.75rem 1rem", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>🌐 Website</div>
            {ngo.website ? (
              <a href={ngo.website.startsWith("http") ? ngo.website : `https://${ngo.website}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary)", fontSize: "0.9rem", wordBreak: "break-all" }}>
                {ngo.website.replace(/^https?:\/\//, "")}
              </a>
            ) : <strong style={{ fontSize: "0.9rem" }}>—</strong>}
          </div>
        </div>

        {/* Action buttons — status-aware, live-updating */}
        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
          
          {/* ── Pending NGO: show both Verify + Reject ── */}
          {!ngo.verified && !ngo.rejected && (
            <>
              <button className="btn-success" style={{ flex: 1, minWidth: 130 }} disabled={isBusy}
                onClick={() => handleAction(onVerify, ngo._id)}>
                {isBusy ? "..." : "✅ Verify NGO"}
              </button>
              <button className="btn-danger-xs" style={{ flex: 1, minWidth: 130, padding: "0.7rem 1rem", fontSize: "0.875rem" }} disabled={isBusy}
                onClick={() => handleAction(onReject, ngo._id)}>
                {isBusy ? "..." : "❌ Reject NGO"}
              </button>
            </>
          )}

          {/* ── Verified NGO: show Revoke button ── */}
          {ngo.verified && !ngo.rejected && (
            <button className="btn-danger-xs" style={{ flex: 1, minWidth: 130, padding: "0.7rem 1rem", fontSize: "0.875rem" }} disabled={isBusy}
              onClick={() => handleAction(onReject, ngo._id)}>
              {isBusy ? "..." : "🚫 Revoke Verification"}
            </button>
          )}

          {/* ── Rejected NGO: show Re-verify button ── */}
          {ngo.rejected && (
            <button className="btn-success" style={{ flex: 1, minWidth: 130 }} disabled={isBusy}
              onClick={() => handleAction(onVerify, ngo._id)}>
              {isBusy ? "..." : "🔄 Re-verify NGO"}
            </button>
          )}

          <button className="btn-sm" style={{ minWidth: 90 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ───────────────────────────────────────────
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activityModal, setActivityModal] = useState(null);
  const [ngoDetailId, setNgoDetailId] = useState(null); // ID of NGO to show in detail modal
  const [confirm, setConfirm] = useState(null); // { type, id, name }
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3000);
  };

  useEffect(() => {
    // Use allSettled so one failed request doesn't break the whole dashboard
    Promise.allSettled([
      api.get("/admin/stats"),
      api.get("/ngo/admin/all"),
      api.get("/admin/users"),
      api.get("/event/all"),
      api.get("/admin/chart-data"),
    ]).then(([statsRes, ngosRes, usersRes, eventsRes, chartRes]) => {
      if (statsRes.status === "fulfilled")   setStats(statsRes.value.data);
      if (ngosRes.status === "fulfilled")    setNgos(ngosRes.value.data.ngos || []);
      if (usersRes.status === "fulfilled")   setUsers(usersRes.value.data.users || []);
      if (eventsRes.status === "fulfilled")  setEvents(eventsRes.value.data.events || []);
      if (chartRes.status === "fulfilled")   setChartData(chartRes.value.data);
    }).finally(() => setStatsLoading(false));
  }, []);

  const handleVerify = async (ngoId) => {
    try {
      await api.put(`/ngo/verify/${ngoId}`);
      flash("NGO verified ✅");
      setNgos(prev => prev.map(n => n._id === ngoId ? { ...n, verified: true, rejected: false } : n));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleReject = async (ngoId) => {
    try {
      await api.put(`/ngo/reject/${ngoId}`);
      flash("NGO rejected");
      setNgos(prev => prev.map(n => n._id === ngoId ? { ...n, verified: false, rejected: true } : n));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      flash("User deleted");
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    setConfirm(null);
  };

  const handleCancelEvent = async (eventId) => {
    try {
      await api.delete(`/event/${eventId}`);
      flash("Event cancelled");
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    setConfirm(null);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      {activityModal && (
        <UserActivityModal
          userId={activityModal.id}
          userName={activityModal.name}
          onClose={() => setActivityModal(null)}
        />
      )}

      {/* Derive live NGO from ngos array so modal is never stale */}
      {ngoDetailId && (() => {
        const liveNgo = ngos.find(n => n._id === ngoDetailId);
        if (!liveNgo) return null;
        return (
          <NGODetailModal
            ngo={liveNgo}
            onClose={() => setNgoDetailId(null)}
            onVerify={(id) => { handleVerify(id); }}
            onReject={(id) => { handleReject(id); }}
          />
        );
      })()}

      <ConfirmModal
        isOpen={!!confirm}
        title={confirm?.type === "user" ? "Delete User?" : "Cancel Event?"}
        message={confirm?.type === "user"
          ? `Are you sure you want to remove "${confirm?.name}"? This cannot be undone.`
          : `Cancel event "${confirm?.name}"? Volunteer applications will also be lost.`}
        confirmText={confirm?.type === "user" ? "Delete" : "Cancel Event"}
        onConfirm={() => confirm?.type === "user" ? handleDeleteUser(confirm.id) : handleCancelEvent(confirm.id)}
        onCancel={() => setConfirm(null)}
        danger
      />

      <div className="dashboard-header">
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <span className="role-badge" style={{ background: "#f59e0b" }}>👨‍💼 Administrator</span>
        </div>
        <p className="email-label">{user?.email}</p>
      </div>

      {message && <div className="alert success">✅ {message}</div>}
      {error && <div className="alert error">⚠️ {error}</div>}

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card skeleton-stat" />
          ))}
        </div>
      ) : stats && (
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-card-num">{stats.totalUsers}</span><span>Total Users</span></div>
          <div className="stat-card green"><span className="stat-card-num">{stats.verifiedNGOs}</span><span>Verified NGOs</span></div>
          <div className="stat-card amber"><span className="stat-card-num">{stats.pendingNGOs}</span><span>Pending Approval</span></div>
          <div className="stat-card blue"><span className="stat-card-num">{stats.totalEvents}</span><span>Total Events</span></div>
          <div className="stat-card purple"><span className="stat-card-num">{stats.totalDonations}</span><span>Donations</span></div>
          <div className="stat-card teal"><span className="stat-card-num">{stats.totalVolunteers}</span><span>Volunteer Apps</span></div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: "2rem" }}>
        {["overview", "charts", "ngos", "events", "users"].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "📊 Overview"
              : tab === "charts" ? "📈 Charts"
              : tab === "ngos" ? "🏢 NGOs"
              : tab === "events" ? "📅 Events"
              : "👥 Users"}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <div className="dash-overview-grid">
            <div className="overview-card">
              <h3>⏳ Pending NGOs</h3>
              {ngos.filter(n => !n.verified && !n.rejected).length === 0 ? (
                <p className="empty">All NGOs reviewed ✅</p>
              ) : (
                ngos.filter(n => !n.verified && !n.rejected).slice(0, 3).map(ngo => (
                  <div key={ngo._id} className="mini-row">
                    <strong>{ngo.name}</strong>
                    <div className="mini-actions">
                      <button className="btn-success btn-xs" onClick={() => handleVerify(ngo._id)}>Verify</button>
                      <button className="btn-danger-xs" onClick={() => handleReject(ngo._id)}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="overview-card">
              <h3>📅 Recent Events</h3>
              {events.length === 0 ? <p className="empty">No events yet</p> : events.slice(0, 4).map(ev => (
                <div key={ev._id} className="mini-row">
                  <div>
                    <strong>{ev.title}</strong>
                    <small> • {ev.ngoId?.name}</small>
                  </div>
                  <small>{ev.date ? formatDate(ev.date) : "TBD"}</small>
                </div>
              ))}
            </div>
            <div className="overview-card">
              <h3>👥 Recent Users</h3>
              {users.slice(0, 4).map(u => (
                <div key={u._id} className="mini-row">
                  <div>
                    <strong>{u.name}</strong>
                    <small> • {u.role}</small>
                  </div>
                  <small>{formatDate(u.createdAt)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Charts Tab ── */}
      {activeTab === "charts" && (
        <div className="tab-content">
          <h2 className="tab-section-title">📈 Platform Analytics</h2>
          {!chartData ? (
            <div className="loading">
              <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
              Loading charts...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Donation Trend — full width */}
              <div className="overview-card" style={{ gridColumn: "1 / -1" }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>📦 Monthly Donations (Last 6 Months)</h3>
                <DonationTrendChart
                  labels={chartData.donationTrend.labels}
                  counts={chartData.donationTrend.counts}
                  amounts={chartData.donationTrend.amounts}
                />
              </div>
              {/* Category Doughnut */}
              <div className="overview-card">
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>🏷️ NGO Categories</h3>
                {chartData.categoryData.labels.length === 0 ? (
                  <p className="empty">No NGOs registered yet</p>
                ) : (
                  <NGOCategoryChart
                    labels={chartData.categoryData.labels}
                    counts={chartData.categoryData.counts}
                  />
                )}
              </div>
              {/* NGO Status Doughnut */}
              <div className="overview-card">
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>🏢 NGO Verification Status</h3>
                <NGOStatusChart
                  verified={chartData.ngoStatus.verified}
                  pending={chartData.ngoStatus.pending}
                  rejected={chartData.ngoStatus.rejected}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NGO Management ── */}
      {activeTab === "ngos" && (
        <div className="tab-content">
          <h2 className="tab-section-title">🏢 All Registered NGOs ({ngos.length})</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Click <strong>"View Details"</strong> to review all NGO information before verifying.
          </p>
          {ngos.length === 0 ? (
            <p className="empty">No NGOs registered yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>NGO Name</th>
                    <th>Category</th>
                    <th>Registered By</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(ngo => (
                    <tr key={ngo._id}>
                      <td>
                        <div>
                          <Link to={`/ngos/${ngo._id}`} className="table-link">{ngo.name}</Link>
                          {ngo.description && (
                            <div style={{ color: "var(--text-dim)", fontSize: "0.73rem", marginTop: "0.15rem", maxWidth: 180 }}>
                              {ngo.description.slice(0, 55)}{ngo.description.length > 55 ? "..." : ""}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{ textTransform: "capitalize", fontSize: "0.7rem" }}>
                          {ngo.category || "other"}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{ngo.createdBy?.name || "—"}</strong>
                          {ngo.createdBy?.email && (
                            <small style={{ display: "block", color: "var(--text-dim)" }}>{ngo.createdBy.email}</small>
                          )}
                        </div>
                      </td>
                      <td>{ngo.location || "—"}</td>
                      <td>{ngo.contact || "—"}</td>
                      <td>
                        {ngo.verified
                          ? <span className="badge badge-green">✅ Verified</span>
                          : ngo.rejected
                          ? <span className="badge badge-red">❌ Rejected</span>
                          : <span className="badge badge-amber">⏳ Pending</span>}
                      </td>
                      <td className="table-actions">
                        <button className="btn-approve" onClick={() => setNgoDetailId(ngo._id)}>
                          View Details
                        </button>
                        {!ngo.verified && !ngo.rejected && (
                          <button className="btn-success btn-xs" onClick={() => handleVerify(ngo._id)}>Verify</button>
                        )}
                        {!ngo.rejected && (
                          <button className="btn-danger-xs" onClick={() => handleReject(ngo._id)}>
                            {ngo.verified ? "Revoke" : "Reject"}
                          </button>
                        )}
                        {ngo.rejected && (
                          <button className="btn-success btn-xs" onClick={() => handleVerify(ngo._id)}>Re-verify</button>
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

      {/* ── Event Management ── */}
      {activeTab === "events" && (
        <div className="tab-content">
          <h2 className="tab-section-title">📅 All Events ({events.length})</h2>
          {events.length === 0 ? (
            <p className="empty">No events yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>NGO</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev._id}>
                      <td><Link to={`/events/${ev._id}`} className="table-link">{ev.title}</Link></td>
                      <td>{ev.ngoId?.name || "—"}</td>
                      <td>{ev.date ? formatDate(ev.date) : "TBD"}</td>
                      <td className="table-actions">
                        <Link to={`/events/${ev._id}`} className="btn-approve" style={{ textDecoration: "none" }}>View</Link>
                        <button className="btn-danger-xs" onClick={() => setConfirm({ type: "event", id: ev._id, name: ev.title })}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── User Management ── */}
      {activeTab === "users" && (
        <div className="tab-content">
          <h2 className="tab-section-title">👥 All Users ({users.length})</h2>
          {users.length === 0 ? (
            <p className="empty">No users found.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badge-amber" : u.role === "ngo" ? "badge-green" : "badge-blue"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="table-actions">
                        <button className="btn-approve" onClick={() => setActivityModal({ id: u._id, name: u.name })}>
                          Activity
                        </button>
                        {u.role !== "admin" && (
                          <button className="btn-danger-xs" onClick={() => setConfirm({ type: "user", id: u._id, name: u.name })}>
                            Remove
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
    </div>
  );
};

// ─── NGO DASHBOARD ─────────────────────────────────────────────
const NGODashboard = ({ user }) => {
  const [myNGO, setMyNGO] = useState(null);
  const [events, setEvents] = useState([]);
  const [ngoStats, setNgoStats] = useState(null);
  const [volunteers, setVolunteers] = useState({}); // eventId -> volunteers[]
  const [expandedEvent, setExpandedEvent] = useState(null); // eventId whose volunteers are shown
  const [activeTab, setActiveTab] = useState("profile");
  const [ngoForm, setNgoForm] = useState({ name: "", description: "", location: "", category: "other", contact: "", website: "", upiId: "", bankName: "", accountHolder: "", accountNumber: "", ifscCode: "" });
  const [createEventForm, setCreateEventForm] = useState({ title: "", description: "", date: "", location: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, name }
  const [submitting, setSubmitting] = useState(false);
  const [ngoReceivedDonations, setNgoReceivedDonations] = useState([]);
  const [donationsTotal, setDonationsTotal] = useState(0);
  const [donationsLoading, setDonationsLoading] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  useEffect(() => {
    api.get("/ngo/my")
      .then(async r => {
        const ngo = r.data.ngo;
        setMyNGO(ngo);
        setNgoForm({
          name: ngo.name,
          description: ngo.description || "",
          location: ngo.location || "",
          category: ngo.category || "other",
          contact: ngo.contact || "",
          website: ngo.website || "",
          upiId:         ngo.upiId         || "",
          bankName:      ngo.bankName      || "",
          accountHolder: ngo.accountHolder || "",
          accountNumber: ngo.accountNumber || "",
          ifscCode:      ngo.ifscCode      || "",
        });
        // Fetch events and stats independently so one failure doesn't break both
        const [evRes, statsRes] = await Promise.allSettled([
          api.get(`/event/ngo/${ngo._id}`),
          api.get(`/ngo/${ngo._id}/stats`),
        ]);
        if (evRes.status === "fulfilled")    setEvents(evRes.value.data.events || []);
        if (statsRes.status === "fulfilled") setNgoStats(statsRes.value.data);
      })
      .catch(() => {/* No NGO registered — show registration form */})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!myNGO) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", ngoForm.name);
      fd.append("description", ngoForm.description);
      fd.append("location", ngoForm.location);
      fd.append("category", ngoForm.category);
      fd.append("contact", ngoForm.contact);
      fd.append("website", ngoForm.website);
      fd.append("upiId",         ngoForm.upiId);
      fd.append("bankName",      ngoForm.bankName);
      fd.append("accountHolder", ngoForm.accountHolder);
      fd.append("accountNumber", ngoForm.accountNumber);
      fd.append("ifscCode",      ngoForm.ifscCode);
      if (photoFile) fd.append("photo", photoFile);
      const { data } = await api.put(`/ngo/profile/${myNGO._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMyNGO(data.ngo);
      setPhotoFile(null);
      flash("Profile updated ✅");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    finally { setSubmitting(false); }
  };

  const handleRegisterNGO = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", ngoForm.name);
      fd.append("description", ngoForm.description);
      fd.append("location", ngoForm.location);
      fd.append("category", ngoForm.category);
      fd.append("contact", ngoForm.contact);
      fd.append("website", ngoForm.website);
      fd.append("upiId",         ngoForm.upiId);
      fd.append("bankName",      ngoForm.bankName);
      fd.append("accountHolder", ngoForm.accountHolder);
      fd.append("accountNumber", ngoForm.accountNumber);
      fd.append("ifscCode",      ngoForm.ifscCode);
      if (photoFile) fd.append("photo", photoFile);
      const { data } = await api.post("/ngo/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMyNGO(data.ngo);
      setPhotoFile(null);
      setPhotoPreview(null);
      flash("NGO registered! Awaiting admin verification 🎉");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    finally { setSubmitting(false); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!myNGO) return flash("Register your NGO first", true);
    if (!myNGO.verified) return flash("Your NGO must be verified before creating events", true);
    setSubmitting(true);
    try {
      const { data } = await api.post("/event/create", { ...createEventForm, ngoId: myNGO._id });
      flash("Event created ✅");
      setEvents(prev => [...prev, data.event]);
      setCreateEventForm({ title: "", description: "", date: "", location: "" });
      setActiveTab("events");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    finally { setSubmitting(false); }
  };

  const handleCancelEvent = async (eventId) => {
    try {
      await api.delete(`/event/${eventId}`);
      flash("Event cancelled");
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
    setConfirm(null);
  };

  const loadVolunteers = async (eventId) => {
    if (volunteers[eventId]) return; // already loaded
    try {
      const { data } = await api.get(`/volunteer/event/${eventId}`);
      setVolunteers(prev => ({ ...prev, [eventId]: data.volunteers || [] }));
    } catch { /* silent */ }
  };

  const toggleVolunteers = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      loadVolunteers(eventId);
    }
  };

  const handleRejectVolunteer = async (appId, eventId) => {
    try {
      await api.put(`/volunteer/reject/${appId}`);
      setVolunteers(prev => ({
        ...prev,
        [eventId]: (prev[eventId] || []).map(v => v._id === appId ? { ...v, status: "rejected" } : v),
      }));
      flash("Application rejected");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleApproveVolunteer = async (appId, eventId) => {
    try {
      await api.put(`/volunteer/approve/${appId}`);
      setVolunteers(prev => ({
        ...prev,
        [eventId]: (prev[eventId] || []).map(v => v._id === appId ? { ...v, status: "approved" } : v),
      }));
      flash("Volunteer approved ✅");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <ConfirmModal
        isOpen={!!confirm}
        title="Cancel Event?"
        message={`Are you sure you want to cancel "${confirm?.name}"? This will remove all associated volunteer applications.`}
        confirmText="Yes, Cancel Event"
        onConfirm={() => handleCancelEvent(confirm.id)}
        onCancel={() => setConfirm(null)}
        danger
      />

      <div className="dashboard-header">
        <div>
          <h1>🏢 NGO Dashboard</h1>
          {myNGO && <span className="role-badge" style={{ background: "#10b981" }}>{myNGO.name}</span>}
        </div>
        <p className="email-label">{user?.email}</p>
      </div>

      {message && <div className="alert success">✅ {message}</div>}
      {error && <div className="alert error">⚠️ {error}</div>}

      {/* NGO Stats */}
      {myNGO && ngoStats && (
        <div className="stats-grid">
          <div className="stat-card green"><span className="stat-card-num">{ngoStats.eventCount}</span><span>Events Created</span></div>
          <div className="stat-card blue"><span className="stat-card-num">{ngoStats.volunteerCount}</span><span>Volunteer Applicants</span></div>
          <div className="stat-card purple"><span className="stat-card-num">{ngoStats.donationCount}</span><span>Donations Received</span></div>
          <div className="stat-card amber">
            <span className="stat-card-num">{myNGO.verified ? "✅" : "⏳"}</span>
            <span>{myNGO.verified ? "Verified" : "Pending Review"}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: "2rem" }}>
        <button className={`tab-btn ${activeTab === "profile" ? "tab-active" : ""}`} onClick={() => setActiveTab("profile")}>👤 Profile</button>
        <button className={`tab-btn ${activeTab === "events" ? "tab-active" : ""}`} onClick={() => setActiveTab("events")}>
          📅 Events ({events.length})
        </button>
        <button className={`tab-btn ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>➕ Create Event</button>
        <button
          className={`tab-btn ${activeTab === "donations" ? "tab-active" : ""}`}
          onClick={() => {
            setActiveTab("donations");
            if (!donationsLoading && ngoReceivedDonations.length === 0 && myNGO) {
              setDonationsLoading(true);
              api.get("/payment/ngo-donations")
                .then(r => {
                  setNgoReceivedDonations(r.data.donations || []);
                  setDonationsTotal(r.data.total || 0);
                })
                .catch(() => {})
                .finally(() => setDonationsLoading(false));
            }
          }}
        >💵 Donations</button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
          Loading your NGO...
        </div>
      ) : (
        <>
          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div className="tab-content">
              {!myNGO ? (
              <div className="donate-card">
                  <h2>📝 Register Your NGO</h2>
                  <p className="section-sub">Fill in your NGO details. An admin will review and verify your registration.</p>
                  <form onSubmit={handleRegisterNGO} className="donate-form">

                    {/* Logo Upload at top */}
                    <div className="form-group" style={{ textAlign: "center" }}>
                      <label>NGO Logo / Photo (optional)</label>
                      <div className="image-upload-area" onClick={() => document.getElementById("reg-photo-input").click()}
                        style={{ maxWidth: 260, margin: "0 auto" }}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" style={{ maxHeight: 130, borderRadius: 8, maxWidth: "100%" }} />
                        ) : (
                          <div className="upload-placeholder">
                            <span>🏢</span>
                            <p>Click to upload logo</p>
                            <small>JPG, PNG, WEBP (max 5MB)</small>
                          </div>
                        )}
                      </div>
                      <input id="reg-photo-input" type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => {
                          const f = e.target.files[0];
                          if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                        }} />
                      {photoPreview && (
                        <button type="button" className="btn-danger-sm" style={{ marginTop: "0.4rem" }}
                          onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    {/* Row 1: Name + Category */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>NGO Name *</label>
                        <input id="reg-ngo-name" placeholder="e.g., Green Hands Foundation"
                          value={ngoForm.name}
                          onChange={e => setNgoForm(f => ({ ...f, name: e.target.value }))} required />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <select id="reg-category" value={ngoForm.category}
                          onChange={e => setNgoForm(f => ({ ...f, category: e.target.value }))}>
                          <option value="education">📚 Education</option>
                          <option value="health">🏥 Health</option>
                          <option value="environment">🌿 Environment</option>
                          <option value="food">🍱 Food</option>
                          <option value="animal">🐾 Animal Welfare</option>
                          <option value="disaster">🆘 Disaster Relief</option>
                          <option value="women">👩 Women Empowerment</option>
                          <option value="youth">👦 Youth Development</option>
                          <option value="other">🌐 Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Location + Contact */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Location</label>
                        <input id="reg-location" placeholder="City, State"
                          value={ngoForm.location}
                          onChange={e => setNgoForm(f => ({ ...f, location: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Contact (Phone / Email)</label>
                        <input id="reg-contact" placeholder="e.g., +91 98765 43210"
                          value={ngoForm.contact}
                          onChange={e => setNgoForm(f => ({ ...f, contact: e.target.value }))} />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="form-group">
                      <label>Website (optional)</label>
                      <input id="reg-website" placeholder="https://yourngodomain.org"
                        value={ngoForm.website}
                        onChange={e => setNgoForm(f => ({ ...f, website: e.target.value }))} />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                      <label>Description</label>
                      <textarea id="reg-description" placeholder="What does your NGO do? What is your mission?"
                        value={ngoForm.description}
                        onChange={e => setNgoForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                    </div>

                    {/* Bank / UPI Details */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                      <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>🏦 Bank / UPI Details <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontWeight: 400 }}>(shown to donors)</span></h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>UPI ID</label>
                          <input id="reg-upi" placeholder="e.g. ngofund@upi"
                            value={ngoForm.upiId}
                            onChange={e => setNgoForm(f => ({ ...f, upiId: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Account Holder Name</label>
                          <input id="reg-acc-holder" placeholder="e.g. Green Hands Foundation"
                            value={ngoForm.accountHolder}
                            onChange={e => setNgoForm(f => ({ ...f, accountHolder: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Bank Name</label>
                          <input id="reg-bank-name" placeholder="e.g. State Bank of India"
                            value={ngoForm.bankName}
                            onChange={e => setNgoForm(f => ({ ...f, bankName: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Account Number</label>
                          <input id="reg-acc-no" placeholder="e.g. 1234567890"
                            value={ngoForm.accountNumber}
                            onChange={e => setNgoForm(f => ({ ...f, accountNumber: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group" style={{ maxWidth: 260 }}>
                        <label>IFSC Code</label>
                        <input id="reg-ifsc" placeholder="e.g. SBIN0001234"
                          value={ngoForm.ifscCode}
                          onChange={e => setNgoForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))} />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? <span className="btn-loading"><span className="btn-spinner" />Registering...</span> : "🏢 Register NGO"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="donate-card">
                  <div className="ngo-profile-top">
                    <div className="ngo-profile-photo">
                      {photoPreview || myNGO.photo
                        ? <img src={photoPreview || getImageUrl(myNGO.photo)} alt="NGO" />
                        : <div className="ngo-avatar lg">{myNGO.name.charAt(0)}</div>}
                    </div>
                    <div>
                      <h2>{myNGO.name}</h2>
                      {myNGO.verified
                        ? <span className="badge badge-green">✅ Verified</span>
                        : myNGO.rejected
                          ? <span className="badge badge-red">❌ Rejected — Contact admin</span>
                          : <span className="badge badge-amber">⏳ Awaiting Verification</span>}
                      {myNGO.location && <p className="location-tag" style={{ marginTop: "0.4rem" }}>📍 {myNGO.location}</p>}
                      {myNGO.description && <p className="detail-desc" style={{ marginTop: "0.4rem", fontSize: "0.875rem" }}>{myNGO.description}</p>}
                    </div>
                  </div>
                  <h3 style={{ marginBottom: "1rem", marginTop: "1.5rem", fontSize: "1rem", fontWeight: 700 }}>✏️ Update Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="donate-form">
                    {/* Row 1: Name + Category */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>NGO Name</label>
                        <input value={ngoForm.name} onChange={e => setNgoForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select value={ngoForm.category} onChange={e => setNgoForm(f => ({ ...f, category: e.target.value }))}>
                          <option value="education">📚 Education</option>
                          <option value="health">🏥 Health</option>
                          <option value="environment">🌿 Environment</option>
                          <option value="food">🍱 Food</option>
                          <option value="animal">🐾 Animal Welfare</option>
                          <option value="disaster">🆘 Disaster Relief</option>
                          <option value="women">👩 Women Empowerment</option>
                          <option value="youth">👦 Youth Development</option>
                          <option value="other">🌐 Other</option>
                        </select>
                      </div>
                    </div>
                    {/* Row 2: Location + Contact */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Location</label>
                        <input placeholder="City, State" value={ngoForm.location}
                          onChange={e => setNgoForm(f => ({ ...f, location: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Contact (Phone / Email)</label>
                        <input placeholder="+91 98765 43210" value={ngoForm.contact}
                          onChange={e => setNgoForm(f => ({ ...f, contact: e.target.value }))} />
                      </div>
                    </div>
                    {/* Website */}
                    <div className="form-group">
                      <label>Website (optional)</label>
                      <input placeholder="https://yourngodomain.org" value={ngoForm.website}
                        onChange={e => setNgoForm(f => ({ ...f, website: e.target.value }))} />
                    </div>
                    {/* Description */}
                    <div className="form-group">
                      <label>Description</label>
                      <textarea value={ngoForm.description}
                        onChange={e => setNgoForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                    </div>
                    {/* Photo Upload */}
                    <div className="form-group">
                      <label>Update NGO Logo / Photo</label>
                      <div className="image-upload-area" onClick={() => document.getElementById("ngo-photo-input").click()}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8, maxWidth: "100%" }} />
                        ) : (
                          <div className="upload-placeholder">
                            <span>📷</span>
                            <p>{photoFile ? photoFile.name : "Click to upload photo"}</p>
                            <small>JPG, PNG, WEBP (max 5MB)</small>
                          </div>
                        )}
                      </div>
                      <input id="ngo-photo-input" type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => {
                          const f = e.target.files[0];
                          if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                        }} />
                    </div>

                    {/* Bank / UPI Details */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                      <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>🏦 Bank / UPI Details <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontWeight: 400 }}>(shown to donors)</span></h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>UPI ID</label>
                          <input id="upd-upi" placeholder="e.g. ngofund@upi"
                            value={ngoForm.upiId}
                            onChange={e => setNgoForm(f => ({ ...f, upiId: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Account Holder Name</label>
                          <input id="upd-acc-holder" placeholder="e.g. Green Hands Foundation"
                            value={ngoForm.accountHolder}
                            onChange={e => setNgoForm(f => ({ ...f, accountHolder: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Bank Name</label>
                          <input id="upd-bank-name" placeholder="e.g. State Bank of India"
                            value={ngoForm.bankName}
                            onChange={e => setNgoForm(f => ({ ...f, bankName: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Account Number</label>
                          <input id="upd-acc-no" placeholder="e.g. 1234567890"
                            value={ngoForm.accountNumber}
                            onChange={e => setNgoForm(f => ({ ...f, accountNumber: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group" style={{ maxWidth: 260 }}>
                        <label>IFSC Code</label>
                        <input id="upd-ifsc" placeholder="e.g. SBIN0001234"
                          value={ngoForm.ifscCode}
                          onChange={e => setNgoForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))} />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? <span className="btn-loading"><span className="btn-spinner" />Updating...</span> : "Update Profile"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── Events Tab ── */}
          {activeTab === "events" && (
            <div className="tab-content">
              {events.length === 0 ? (
                <div className="empty-state">
                  <span>📭</span>
                  <h3>No events yet</h3>
                  <p>Create your first event to start recruiting volunteers!</p>
                  <button className="btn-primary" style={{ marginTop: "1rem", width: "auto", padding: "0.6rem 1.5rem" }}
                    onClick={() => setActiveTab("create")}>
                    ➕ Create Event
                  </button>
                </div>
              ) : (
                <>
                  {/* Volunteer Chart — only show when some volunteers data is loaded */}
                  {events.length > 0 && Object.keys(volunteers).length > 0 && (
                    <div className="overview-card" style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 700 }}>📊 Volunteers Per Event</h3>
                      <VolunteersPerEventChart events={events} volunteersMap={volunteers} />
                    </div>
                  )}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {events.map(ev => (
                    <div key={ev._id} className="event-manage-card">
                      <div className="event-manage-header">
                        <div>
                          <div className="event-date">{ev.date ? formatDate(ev.date) : "Date TBD"}</div>
                          <Link to={`/events/${ev._id}`} className="event-manage-title">{ev.title}</Link>
                          {ev.description && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{ev.description.slice(0, 120)}{ev.description.length > 120 ? "..." : ""}</p>}
                        </div>
                        <div className="table-actions">
                          <button
                            className={`btn-approve ${expandedEvent === ev._id ? "active" : ""}`}
                            onClick={() => toggleVolunteers(ev._id)}
                          >
                            👥 Volunteers {expandedEvent === ev._id ? "▲" : "▼"}
                          </button>
                          <Link to={`/events/${ev._id}`} className="btn-approve" style={{ textDecoration: "none" }}>View</Link>
                          <button className="btn-danger-xs" onClick={() => setConfirm({ id: ev._id, name: ev.title })}>Cancel</button>
                        </div>
                      </div>

                      {/* ── Inline Volunteer Panel (FIXED BUG) ── */}
                      {expandedEvent === ev._id && (
                        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                          <h4 style={{ marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>
                            👥 Volunteer Applications
                          </h4>
                          {!volunteers[ev._id] ? (
                            <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-dim)" }}>
                              <div className="spinner-ring" style={{ margin: "0 auto 0.5rem" }} />
                              Loading...
                            </div>
                          ) : volunteers[ev._id].length === 0 ? (
                            <p className="empty" style={{ margin: 0 }}>No applications yet for this event.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {volunteers[ev._id].map(v => (
                                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--bg3)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                                  <div className="nav-avatar" style={{ width: 32, height: 32, fontSize: "0.85rem", flexShrink: 0 }}>
                                    {v.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <strong style={{ color: "var(--text)" }}>{v.userId?.name || "Unknown"}</strong>
                                    <small style={{ display: "block", color: "var(--text-dim)" }}>{v.userId?.email}</small>
                                  </div>
                                  <span className={`badge ${v.status === "approved" ? "badge-green" : v.status === "rejected" ? "badge-red" : "badge-amber"}`}>
                                    {v.status === "approved" ? "✅ Approved" : v.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                                  </span>
                                  <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {v.status !== "approved" && (
                                      <button className="btn-success btn-xs" onClick={() => handleApproveVolunteer(v._id, ev._id)}>Approve</button>
                                    )}
                                    {v.status !== "rejected" && (
                                      <button className="btn-danger-xs" onClick={() => handleRejectVolunteer(v._id, ev._id)}>Reject</button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
          )}


          {/* ── Create Event Tab ── */}
          {activeTab === "create" && (
            <div className="tab-content">
              <div className="donate-card">
                <h2>➕ Create New Event</h2>
                <p className="section-sub">
                  {!myNGO
                    ? "Register your NGO first before creating events."
                    : !myNGO.verified
                    ? "Your NGO must be verified by admin before you can create events."
                    : "Fill in event details. Volunteers can browse and apply."}
                </p>
                <form onSubmit={handleCreateEvent} className="donate-form">
                  <div className="form-group">
                    <label>Event Title *</label>
                    <input placeholder="e.g., Tree Plantation Drive" value={createEventForm.title}
                      onChange={e => setCreateEventForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Describe the event, what volunteers will do, what to bring..."
                      value={createEventForm.description}
                      onChange={e => setCreateEventForm(f => ({ ...f, description: e.target.value }))} rows={4} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date</label>
                      <input type="date" value={createEventForm.date}
                        onChange={e => setCreateEventForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Event Location</label>
                      <input placeholder="e.g., Mumbai, Maharashtra" value={createEventForm.location}
                        onChange={e => setCreateEventForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary"
                    disabled={!myNGO || !myNGO.verified || submitting}>
                    {submitting
                      ? <span className="btn-loading"><span className="btn-spinner" />Creating...</span>
                      : !myNGO ? "Register NGO First"
                      : !myNGO.verified ? "NGO Not Verified Yet"
                      : "✅ Create Event"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Received Donations Tab ── */}
          {activeTab === "donations" && (
            <div className="tab-content">
              <h2 className="tab-section-title">💵 Received Donations</h2>
              {donationsLoading ? (
                <div className="loading">
                  <div className="spinner-ring" style={{ margin:"0 auto 1rem" }} />
                  Loading donations...
                </div>
              ) : (
                <>
                  <div className="ngo-total-banner">
                    <div>
                      <div className="ngo-total-label">Total Received (Verified Payments)</div>
                      <div className="ngo-total-value">₹{donationsTotal.toLocaleString("en-IN")}</div>
                    </div>
                    <span className="badge badge-green">✅ {ngoReceivedDonations.length} donation{ngoReceivedDonations.length !== 1 ? "s" : ""}</span>
                  </div>
                  {ngoReceivedDonations.length === 0 ? (
                    <div className="empty-state">
                      <span>💝</span>
                      <h3>No donations yet</h3>
                      <p>Verified Razorpay donations will appear here once donors contribute to your NGO.</p>
                    </div>
                  ) : (
                    <div className="ngo-donations-panel">
                      {ngoReceivedDonations.map(d => (
                        <div key={d._id} className="ngo-donation-row">
                          <div className="ngo-donation-amount">₹{d.amount?.toLocaleString("en-IN")}</div>
                          <div className="ngo-donation-donor">
                            <strong>{d.donorId?.name || "Anonymous"}</strong>
                            <small>{d.donorId?.email}</small>
                          </div>
                          {d.description && (
                            <small style={{ color:"var(--text-dim)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              "{d.description}"
                            </small>
                          )}
                          <small style={{ color:"var(--text-dim)", flexShrink:0 }}>
                            {new Date(d.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                          </small>
                          <span className="badge badge-green">✅ Paid</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── USER DASHBOARD ─────────────────────────────────────────────
const UserDashboard = ({ user }) => {
  const [myApplications, setMyApplications] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [flashMsg, setFlashMsg] = useState("");

  const showFlash = (msg) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(""), 3000); };

  useEffect(() => {
    Promise.all([
      api.get("/volunteer/my"),
      api.get("/donation/my"),
    ]).then(([volRes, donRes]) => {
      setMyApplications(volRes.data.applications || []);
      setMyDonations(donRes.data.donations || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Withdraw this application?")) return;
    setWithdrawing(appId);
    try {
      await api.delete(`/volunteer/${appId}`);
      setMyApplications(prev => prev.filter(a => a._id !== appId));
      showFlash("Application withdrawn successfully");
    } catch (err) {
      showFlash(err.response?.data?.message || "Error withdrawing");
    } finally { setWithdrawing(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      {flashMsg && <div className="alert success" style={{ marginBottom: "1rem" }}>✅ {flashMsg}</div>}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name} 👋</h1>
          <span className="role-badge" style={{ background: "#6366f1" }}>🙋 Volunteer</span>
        </div>
        <p className="email-label">{user?.email}</p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Link to="/profile" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.5rem", borderRadius: "8px", width: "auto" }}>
          👤 View Full Profile
        </Link>
        <Link to="/donate" className="btn-success" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.5rem", borderRadius: "8px" }}>
          💝 Make a Donation
        </Link>
        <Link to="/events" className="btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.5rem", borderRadius: "8px", fontSize: "0.95rem" }}>
          📅 Browse Events
        </Link>
        <Link to="/ngos" className="btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 1.5rem", borderRadius: "8px", fontSize: "0.95rem", background: "var(--accent)" }}>
          🏢 Browse NGOs
        </Link>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner-ring" style={{ margin: "0 auto 1rem" }} />
          Loading your activity...
        </div>
      ) : (
        <>
          <div className="profile-stats" style={{ marginBottom: "2rem" }}>
            <div className="profile-stat"><span className="stat-value">{myDonations.length}</span><span className="stat-label">Donations</span></div>
            <div className="profile-stat"><span className="stat-value">{myApplications.length}</span><span className="stat-label">Events Applied</span></div>
            <div className="profile-stat"><span className="stat-value">{myApplications.filter(a => a.status === "approved").length}</span><span className="stat-label">Approved</span></div>
          </div>

          <div className="dashboard-section">
            <div className="section-header" style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 0 }}>🙋 Recent Applications</h2>
              <Link to="/profile" className="view-all-link">View All →</Link>
            </div>
            {myApplications.length === 0 ? (
              <p className="empty">No applications yet. <Link to="/events">Browse Events →</Link></p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {myApplications.slice(0, 4).map(app => (
                  <div key={app._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "var(--bg3)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "1.4rem" }}>📅</span>
                    <div style={{ flex: 1 }}>
                      <Link to={`/events/${app.eventId?._id}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                        {app.eventId?.title || "Event"}
                      </Link>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                        {app.eventId?.ngoId && (
                          <Link to={`/ngos/${app.eventId.ngoId._id || app.eventId.ngoId}`} style={{ fontSize: "0.8rem", color: "var(--text-dim)", textDecoration: "none" }}>
                            🏢 {app.eventId.ngoId.name || app.eventId.ngoId}
                          </Link>
                        )}
                        {app.eventId?.date && (
                          <small style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                            📅 {new Date(app.eventId.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </small>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${
                      app.status === "approved" ? "badge-green" :
                      app.status === "rejected" ? "badge-red" : "badge-amber"
                    }`}>
                      {app.status === "approved" ? "✅ Approved" : app.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                    </span>
                    {app.status === "pending" && (
                      <button
                        className="btn-danger-xs"
                        disabled={withdrawing === app._id}
                        onClick={() => handleWithdraw(app._id)}
                        style={{ flexShrink: 0 }}
                      >
                        {withdrawing === app._id ? "..." : "Withdraw"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header" style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 0 }}>📦 Recent Donations</h2>
              <Link to="/donate" className="view-all-link">Donate More →</Link>
            </div>
            {myDonations.length === 0 ? (
              <p className="empty">No donations yet. <Link to="/donate">Donate Now →</Link></p>
            ) : (
              <div className="donation-history">
                {myDonations.slice(0, 3).map(d => (
                  <div key={d._id} className="donation-row">
                    <div className="donation-icon">{d.type === "money" ? "💵" : "📦"}</div>
                    <div className="donation-info">
                      <strong>{d.type === "money" ? `₹${d.amount}` : d.itemName}</strong>
                      {d.ngoId && <span className="donation-ngo">→ {d.ngoId.name}</span>}
                    </div>
                    <small style={{ color: "var(--text-dim)" }}>{formatDate(d.createdAt)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── MAIN DASHBOARD PAGE ───────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;
  if (user.role === "admin") return <div className="page"><AdminDashboard user={user} /></div>;
  if (user.role === "ngo") return <div className="page"><NGODashboard user={user} /></div>;
  return <div className="page"><UserDashboard user={user} /></div>;
};

export default DashboardPage;
