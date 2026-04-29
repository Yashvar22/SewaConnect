import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CAT_ICONS = { education:"📚", health:"🏥", environment:"🌿", food:"🍱", animal:"🐾", disaster:"🆘", women:"👩", youth:"👦", other:"🌐" };

const HomePage = () => {
  const { user } = useAuth();
  const [ngos, setNgos] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ ngos: 0, events: 0, volunteers: 0, donations: 0 });

  useEffect(() => {
    api.get("/ngo/all").then(r => {
      setNgos(r.data.ngos.slice(0, 3));
      setStats(s => ({ ...s, ngos: r.data.count }));
    }).catch(() => {});
    api.get("/event/all").then(r => {
      setEvents(r.data.events.slice(0, 3));
      setStats(s => ({ ...s, events: r.data.count }));
    }).catch(() => {});
  }, []);

  const formatDate = d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">🌿 Making Impact Together</span>
          <h1 className="hero-title">
            Connect.<br />
            <span className="hero-highlight">Volunteer.</span><br />
            Change the World.
          </h1>
          <p className="hero-sub">
            SewaConnect bridges passionate volunteers, generous donors, and verified NGOs
            working together to build a better tomorrow across India.
          </p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/events" className="hero-btn-primary">Browse Events →</Link>
                <Link to="/donate" className="hero-btn-ghost">💝 Donate Now</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hero-btn-primary">Join as Volunteer →</Link>
                <Link to="/ngos" className="hero-btn-ghost">Explore NGOs</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="floating-card c1"><span>🏢</span><div><strong>{stats.ngos}+</strong><small>Verified NGOs</small></div></div>
          <div className="floating-card c2"><span>📅</span><div><strong>{stats.events}+</strong><small>Active Events</small></div></div>
          <div className="floating-card c3"><span>🙋</span><div><strong>Join</strong><small>as Volunteer</small></div></div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────── */}
      <section className="stats-bar">
        {[
          { icon: "🏢", num: `${stats.ngos}+`, label: "Verified NGOs" },
          { icon: "📅", num: `${stats.events}+`, label: "Active Events" },
          { icon: "🙋", num: "500+", label: "Volunteers" },
          { icon: "📦", num: "200+", label: "Donations Made" },
        ].map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-num">{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="how-section">
        <div className="section-header" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center" }}>
          <h2>How It Works</h2>
          <p>Three simple steps to start making a difference</p>
        </div>
        <div className="how-grid">
          {[
            { step: "1", icon: "📝", title: "Register", desc: "Create a free account as a volunteer, NGO, or donor in minutes." },
            { step: "2", icon: "🔍", title: "Discover", desc: "Browse verified NGOs and upcoming events in your area." },
            { step: "3", icon: "🤝", title: "Volunteer", desc: "Apply for events, donate resources, and track your impact." },
            { step: "4", icon: "🌟", title: "Impact", desc: "Get approved, show up, and make a real difference in your community." },
          ].map(item => (
            <div key={item.step} className="how-card">
              <div className="how-step">{item.step}</div>
              <span className="how-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED NGOs ──────────────────────────────── */}
      <section className="home-section alt-bg">
        <div className="section-header">
          <div><h2>Featured NGOs</h2><p>Trusted organisations making a difference</p></div>
          <Link to="/ngos" className="view-all-link">View All →</Link>
        </div>
        {ngos.length === 0 ? (
          <p className="empty">No verified NGOs yet.</p>
        ) : (
          <div className="card-grid">
            {ngos.map(ngo => (
              <Link to={`/ngos/${ngo._id}`} key={ngo._id} className="card ngo-card link-card">
                <div className="ngo-avatar">
                  {ngo.photo
                    ? <img src={ngo.photo.startsWith("http") ? ngo.photo : `http://localhost:5000${ngo.photo}`} alt={ngo.name} className="ngo-photo" />
                    : ngo.name.charAt(0).toUpperCase()}
                </div>
                <div className="card-title">{ngo.name}</div>
                <p>{ngo.description ? (ngo.description.length > 90 ? ngo.description.slice(0,90)+"..." : ngo.description) : "Dedicated to positive impact."}</p>
                <div className="card-footer">
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                    {ngo.location && <span className="location-tag">📍 {ngo.location}</span>}
                    {ngo.category && <span className="cat-badge">{CAT_ICONS[ngo.category]} {ngo.category}</span>}
                  </div>
                  <span className="badge badge-green">✅ Verified</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── UPCOMING EVENTS ────────────────────────────── */}
      <section className="home-section">
        <div className="section-header">
          <div><h2>Upcoming Events</h2><p>Join events that matter to your community</p></div>
          <Link to="/events" className="view-all-link">View All →</Link>
        </div>
        {events.length === 0 ? (
          <p className="empty">No events yet.</p>
        ) : (
          <div className="card-grid">
            {events.map(ev => (
              <Link to={`/events/${ev._id}`} key={ev._id} className="card event-card link-card">
                <div className="event-date">{ev.date ? formatDate(ev.date) : "Date TBD"}</div>
                <div className="card-title">{ev.title}</div>
                <p>{ev.description ? (ev.description.length > 100 ? ev.description.slice(0,100)+"..." : ev.description) : "Join this impactful event."}</p>
                <div className="card-footer">
                  <span className="card-meta">🏢 {ev.ngoId?.name}</span>
                  <span className="chip">Apply →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── IMPACT NUMBERS ─────────────────────────────── */}
      <section className="impact-section">
        <div className="impact-grid">
          {[
            { num: "50+", label: "NGOs Registered" },
            { num: "200+", label: "Events Organized" },
            { num: "5,000+", label: "Volunteers Empowered" },
            { num: "₹10L+", label: "Donations Facilitated" },
          ].map(item => (
            <div key={item.label}>
              <span className="impact-num">{item.num}</span>
              <span className="impact-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to make a difference?</h2>
          <p>Join thousands of volunteers and NGOs creating real impact across India.</p>
          <div className="hero-buttons" style={{ justifyContent: "center" }}>
            <Link to="/register" className="hero-btn-primary">Register Your NGO</Link>
            <Link to="/donate" className="hero-btn-ghost">Make a Donation</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
