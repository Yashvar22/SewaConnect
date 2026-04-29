import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const EventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [applied, setApplied] = useState(new Set()); // eventIds the user already applied to
  const [applying, setApplying] = useState(null); // eventId currently being applied

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // Load events + user's existing applications in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes] = await Promise.all([
          api.get("/event/all"),
        ]);
        setEvents(eventsRes.data.events || []);

        // If logged-in user, load their applications to pre-mark applied events
        if (user?.role === "user") {
          try {
            const volRes = await api.get("/volunteer/my");
            const appliedIds = new Set(
              (volRes.data.applications || []).map(a => a.eventId?._id).filter(Boolean)
            );
            setApplied(appliedIds);
          } catch {
            // Silently fail – user sees Apply buttons but apply will handle duplication server-side
          }
        }
      } catch {
        addToast("Could not load events", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleApply = async (eventId) => {
    if (!user) {
      addToast("Please login to apply for events", "error");
      navigate("/login");
      return;
    }
    if (applied.has(eventId)) {
      addToast("You have already applied for this event!", "error");
      return;
    }
    setApplying(eventId);
    try {
      await api.post("/volunteer/apply", { eventId });
      setApplied(prev => new Set([...prev, eventId]));
      addToast("✅ Application submitted! Status: Pending");
    } catch (err) {
      addToast(err.response?.data?.message || "Error applying", "error");
    } finally {
      setApplying(null);
    }
  };

  const filtered = events.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    (ev.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (ev.ngoId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (ev.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="page">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === "success" ? "✅" : "⚠️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="page-header">
        <h1>📅 Upcoming Events</h1>
        <p>Join events that matter to your community and make a real difference</p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search events by title, description, NGO, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          id="event-search"
        />
        {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
      </div>

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line narrow" style={{ marginBottom: "0.35rem" }} />
              <div className="skeleton-line wide" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line medium" />
              <div className="skeleton-footer">
                <div className="skeleton-badge" />
                <div className="skeleton-chip" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <h3>{search ? "No events match your search" : "No events yet"}</h3>
          <p>{search ? "Try a different keyword" : "NGOs will publish events for volunteers soon"}</p>
        </div>
      ) : (
        <>
          <p className="results-count">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="card-grid">
            {filtered.map(event => {
              const isApplied = applied.has(event._id);
              const isApplying = applying === event._id;
              return (
                <div key={event._id} className="card event-card" style={{ position: "relative" }}>
                  <div className="event-date">
                    📅 {event.date ? formatDate(event.date) : "Date TBD"}
                  </div>
                  <div className="card-title">
                    <Link to={`/events/${event._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {event.title}
                    </Link>
                  </div>

                  {/* Description */}
                  <p style={{ margin: "0.4rem 0 0.6rem", color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                    {event.description
                      ? event.description.length > 110 ? event.description.slice(0, 110) + "..." : event.description
                      : "Join this impactful event and contribute to a better community."}
                  </p>

                  {/* NGO & Location info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.75rem" }}>
                    <Link
                      to={`/ngos/${event.ngoId?._id}`}
                      className="card-meta"
                      style={{ color: "var(--text-muted)", opacity: 1, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                      onClick={e => e.stopPropagation()}
                    >
                      🏢 <span style={{ fontWeight: 600 }}>{event.ngoId?.name || "NGO"}</span>
                      {event.ngoId?.verified && <span className="badge badge-green" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>✅ Verified</span>}
                    </Link>
                    {event.location && (
                      <span className="card-meta" style={{ fontSize: "0.8rem" }}>📍 {event.location}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="card-footer" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "auto" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
                      {/* Apply Button — only for logged-in regular users */}
                      {user?.role === "user" && (
                        <button
                          id={`apply-btn-${event._id}`}
                          className={isApplied ? "btn-success btn-xs" : "btn-sm"}
                          onClick={() => handleApply(event._id)}
                          disabled={isApplied || isApplying}
                          style={{ opacity: isApplied ? 0.8 : 1, flex: 1, minWidth: "80px" }}
                        >
                          {isApplying ? "⏳ Applying..." : isApplied ? "✅ Applied" : "🙋 Apply"}
                        </button>
                      )}
                      {/* Not logged in */}
                      {!user && (
                        <button
                          className="btn-sm"
                          onClick={() => navigate("/login")}
                          style={{ flex: 1, minWidth: "80px" }}
                        >
                          🙋 Apply
                        </button>
                      )}
                      {/* More Details button */}
                      <Link
                        to={`/events/${event._id}`}
                        id={`details-btn-${event._id}`}
                        className="chip"
                        style={{ flex: 1, textAlign: "center", textDecoration: "none", minWidth: "90px" }}
                      >
                        More Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EventPage;
