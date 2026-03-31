import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 {userName}'s Activity</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div className="loading" style={{ padding: "2rem" }}>Loading activity...</div>
        ) : !data ? (
          <p className="empty">Could not load activity</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div className="stat-card blue"><span className="stat-card-num">{data.donations?.length || 0}</span><span>Donations</span></div>
              <div className="stat-card green"><span className="stat-card-num">{data.applications?.length || 0}</span><span>Event Applications</span></div>
            </div>

            <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>📦 Donations</h3>
            {data.donations?.length === 0 ? (
              <p className="empty" style={{ marginBottom: "1.25rem" }}>No donations yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {data.donations.slice(0, 5).map(d => (
                  <div key={d._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--bg3)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span>{d.type === "money" ? "💵" : "📦"}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--text)" }}>{d.type === "money" ? `₹${d.amount}` : d.itemName}</strong>
                      {d.ngoId && <small style={{ display: "block", color: "var(--text-muted)" }}>→ {d.ngoId.name}</small>}
                    </div>
                    <small style={{ color: "var(--text-dim)" }}>{formatDate(d.createdAt)}</small>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>📅 Event Applications</h3>
            {data.applications?.length === 0 ? (
              <p className="empty">No applications yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {data.applications.slice(0, 5).map(app => (
                  <div key={app._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.9rem", background: "var(--bg3)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span>📅</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--text)" }}>{app.eventId?.title || "Event"}</strong>
                      {app.eventId?.ngoId && <small style={{ display: "block", color: "var(--text-muted)" }}>🏢 {app.eventId.ngoId.name}</small>}
                    </div>
                    <span className={`badge ${app.status === "approved" ? "badge-green" : "badge-amber"}`}>
                      {app.status === "approved" ? "Approved" : "Pending"}
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

// ─── ADMIN DASHBOARD ───────────────────────────────────────────
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activityModal, setActivityModal] = useState(null); // { id, name }

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3000);
  };

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/ngo/admin/all").then(r => setNgos(r.data.ngos)).catch(() => {});
    api.get("/admin/users").then(r => setUsers(r.data.users)).catch(() => {});
    api.get("/event/all").then(r => setEvents(r.data.events)).catch(() => {});
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
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      flash("User deleted");
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await api.delete(`/event/${eventId}`);
      flash("Event cancelled");
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
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
      {stats && (
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
        {["overview", "ngos", "events", "users"].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "📊 Overview" : tab === "ngos" ? "🏢 NGOs" : tab === "events" ? "📅 Events" : "👥 Users"}
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
              {events.slice(0, 4).map(ev => (
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

      {/* ── NGO Management ── */}
      {activeTab === "ngos" && (
        <div className="tab-content">
          <h2 className="tab-section-title">🏢 All Registered NGOs ({ngos.length})</h2>
          {ngos.length === 0 ? (
            <p className="empty">No NGOs registered yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>NGO Name</th>
                    <th>Registered By</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(ngo => (
                    <tr key={ngo._id}>
                      <td>
                        <Link to={`/ngos/${ngo._id}`} className="table-link">{ngo.name}</Link>
                      </td>
                      <td>{ngo.createdBy?.name || "—"}</td>
                      <td>{ngo.location || "—"}</td>
                      <td>
                        {ngo.verified
                          ? <span className="badge badge-green">✅ Verified</span>
                          : ngo.rejected
                          ? <span className="badge badge-red">❌ Rejected</span>
                          : <span className="badge badge-amber">⏳ Pending</span>}
                      </td>
                      <td className="table-actions">
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
                      <td>
                        <Link to={`/events/${ev._id}`} className="table-link">{ev.title}</Link>
                      </td>
                      <td>{ev.ngoId?.name || "—"}</td>
                      <td>{ev.date ? formatDate(ev.date) : "TBD"}</td>
                      <td className="table-actions">
                        <Link to={`/events/${ev._id}`} className="btn-approve" style={{ textDecoration: "none" }}>View</Link>
                        <button className="btn-danger-xs" onClick={() => handleCancelEvent(ev._id)}>Cancel</button>
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
                        <button
                          className="btn-approve"
                          onClick={() => setActivityModal({ id: u._id, name: u.name })}
                        >
                          Activity
                        </button>
                        {u.role !== "admin" && (
                          <button className="btn-danger-xs" onClick={() => handleDeleteUser(u._id)}>
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
  const [activeTab, setActiveTab] = useState("profile");
  const [ngoForm, setNgoForm] = useState({ name: "", description: "", location: "" });
  const [createEventForm, setCreateEventForm] = useState({ title: "", description: "", date: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  useEffect(() => {
    api.get("/ngo/my")
      .then(r => {
        const ngo = r.data.ngo;
        setMyNGO(ngo);
        setNgoForm({ name: ngo.name, description: ngo.description || "", location: ngo.location || "" });
        return Promise.all([
          api.get(`/event/ngo/${ngo._id}`),
          api.get(`/ngo/${ngo._id}/stats`),
        ]);
      })
      .then(([evRes, statsRes]) => {
        setEvents(evRes.data.events || []);
        setNgoStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!myNGO) return;
    try {
      const fd = new FormData();
      fd.append("name", ngoForm.name);
      fd.append("description", ngoForm.description);
      fd.append("location", ngoForm.location);
      if (photoFile) fd.append("photo", photoFile);
      const { data } = await api.put(`/ngo/profile/${myNGO._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMyNGO(data.ngo);
      flash("Profile updated ✅");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleRegisterNGO = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/ngo/register", ngoForm);
      setMyNGO(data.ngo);
      flash("NGO registered! Awaiting admin verification 🎉");
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!myNGO) return flash("Register your NGO first", true);
    if (!myNGO.verified) return flash("Your NGO must be verified before creating events", true);
    try {
      const { data } = await api.post("/event/create", { ...createEventForm, ngoId: myNGO._id });
      flash("Event created ✅");
      setEvents(prev => [...prev, data.event]);
      setCreateEventForm({ title: "", description: "", date: "" });
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await api.delete(`/event/${eventId}`);
      flash("Event cancelled");
      setEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) { flash(err.response?.data?.message || "Error", true); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
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
        <button className={`tab-btn ${activeTab === "profile" ? "tab-active" : ""}`} onClick={() => setActiveTab("profile")}>
          👤 Profile
        </button>
        <button className={`tab-btn ${activeTab === "events" ? "tab-active" : ""}`} onClick={() => setActiveTab("events")}>
          📅 Events ({events.length})
        </button>
        <button className={`tab-btn ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>
          ➕ Create Event
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div className="tab-content">
              {!myNGO ? (
                <div className="donate-card">
                  <h2>📝 Register Your NGO</h2>
                  <p className="section-sub">Fill in the details to register your NGO. An admin will verify it.</p>
                  <form onSubmit={handleRegisterNGO} className="donate-form">
                    <div className="form-group">
                      <label>NGO Name *</label>
                      <input placeholder="e.g., Green Hands Foundation" value={ngoForm.name}
                        onChange={e => setNgoForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea placeholder="What does your NGO do?" value={ngoForm.description}
                        onChange={e => setNgoForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input placeholder="City, State" value={ngoForm.location}
                        onChange={e => setNgoForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn-primary">Register NGO</button>
                  </form>
                </div>
              ) : (
                <div className="donate-card">
                  <div className="ngo-profile-top">
                    <div className="ngo-profile-photo">
                      {photoPreview || myNGO.photo
                        ? <img src={photoPreview || `http://localhost:5000${myNGO.photo}`} alt="NGO" />
                        : <div className="ngo-avatar lg">{myNGO.name.charAt(0)}</div>}
                    </div>
                    <div>
                      <h2>{myNGO.name}</h2>
                      {myNGO.verified
                        ? <span className="badge badge-green">✅ Verified</span>
                        : <span className="badge badge-amber">⏳ Awaiting Verification</span>}
                      {myNGO.location && <p className="location-tag" style={{ marginTop: "0.4rem" }}>📍 {myNGO.location}</p>}
                      {myNGO.description && <p className="detail-desc" style={{ marginTop: "0.4rem", fontSize: "0.875rem" }}>{myNGO.description}</p>}
                    </div>
                  </div>
                  <h3 style={{ marginBottom: "1rem", marginTop: "1.5rem", fontSize: "1rem", fontWeight: 700 }}>✏️ Update Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="donate-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>NGO Name</label>
                        <input value={ngoForm.name} onChange={e => setNgoForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Location</label>
                        <input placeholder="City, State" value={ngoForm.location}
                          onChange={e => setNgoForm(f => ({ ...f, location: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea value={ngoForm.description}
                        onChange={e => setNgoForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                    </div>
                    <div className="form-group">
                      <label>Upload NGO Photo</label>
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
                    <button type="submit" className="btn-primary">Update Profile</button>
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
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Event Title</th><th>Date</th><th>Description</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {events.map(ev => (
                        <tr key={ev._id}>
                          <td>
                            <Link to={`/events/${ev._id}`} className="table-link">{ev.title}</Link>
                          </td>
                          <td>{ev.date ? formatDate(ev.date) : "TBD"}</td>
                          <td>{ev.description ? ev.description.slice(0, 60) + "..." : "—"}</td>
                          <td className="table-actions">
                            <Link to={`/events/${ev._id}`} className="btn-approve" style={{ textDecoration: "none" }}>View</Link>
                            <button className="btn-danger-xs" onClick={() => handleCancelEvent(ev._id)}>Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  <div className="form-group">
                    <label>Event Date</label>
                    <input type="date" value={createEventForm.date}
                      onChange={e => setCreateEventForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn-primary"
                    disabled={!myNGO || !myNGO.verified}>
                    {!myNGO ? "Register NGO First" : !myNGO.verified ? "NGO Not Verified Yet" : "✅ Create Event"}
                  </button>
                </form>
              </div>
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

  useEffect(() => {
    Promise.all([
      api.get("/volunteer/my"),
      api.get("/donation/my"),
    ]).then(([volRes, donRes]) => {
      setMyApplications(volRes.data.applications || []);
      setMyDonations(donRes.data.donations || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
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

      {loading ? <div className="loading">Loading...</div> : (
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
              <div className="card-grid">
                {myApplications.slice(0, 3).map(app => (
                  <Link key={app._id} to={`/events/${app.eventId?._id}`} className="card link-card">
                    <div className="event-date">{app.eventId?.date ? formatDate(app.eventId.date) : "Date TBD"}</div>
                    <div className="card-title">{app.eventId?.title || "Event"}</div>
                    {app.eventId?.ngoId && <span className="card-meta">🏢 {app.eventId.ngoId.name}</span>}
                    <span className={`badge ${app.status === "approved" ? "badge-green" : "badge-amber"}`}>
                      {app.status === "approved" ? "✅ Approved" : "⏳ Pending"}
                    </span>
                  </Link>
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
