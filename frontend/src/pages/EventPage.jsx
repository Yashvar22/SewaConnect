import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const EventPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  useEffect(() => {
    api.get("/event/all")
      .then(r => setEvents(r.data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (eventId) => {
    if (!user) return flash("Please login to apply", true);
    try {
      await api.post("/volunteer/apply", { userId: user._id, eventId });
      flash("Application submitted ✅ Status: Pending");
    } catch (err) {
      flash(err.response?.data?.message || "Error applying", true);
    }
  };

  const filtered = events.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    (ev.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (ev.ngoId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Upcoming Events</h1>
        <p>Join events that matter to your community and make a real difference</p>
      </div>

      {message && <div className="alert success">✅ {message}</div>}
      {error && <div className="alert error">⚠️ {error}</div>}

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search events by title, description, or NGO..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          id="event-search"
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* Event listing */}
      {loading ? (
        <div className="loading">Loading events...</div>
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
            {filtered.map(event => (
              <div key={event._id} className="card event-card" style={{ position: "relative" }}>
                <div className="event-date">
                  {event.date ? formatDate(event.date) : "Date TBD"}
                </div>
                <div className="card-title">
                  <Link to={`/events/${event._id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {event.title}
                  </Link>
                </div>
                <p>{event.description
                  ? event.description.length > 110 ? event.description.slice(0, 110) + "..." : event.description
                  : "Join this impactful event and contribute to a better community."}</p>
                <div className="card-footer">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <Link
                      to={`/ngos/${event.ngoId?._id}`}
                      className="card-meta"
                      style={{ color: "var(--text-muted)", opacity: 1 }}
                      onClick={e => e.stopPropagation()}
                    >
                      🏢 {event.ngoId?.name || "NGO"}
                    </Link>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {user?.role === "user" && (
                      <button className="btn-sm" onClick={() => handleApply(event._id)}>
                        Apply
                      </button>
                    )}
                    <Link to={`/events/${event._id}`} className="chip">View →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EventPage;
