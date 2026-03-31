import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const NGOListPage = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ngo/all")
      .then(r => setNgos(r.data.ngos))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = ngos.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    (n.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (n.location || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏢 Verified NGOs</h1>
        <p>Trusted organizations making a difference across India</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name, description, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          id="ngo-search"
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading NGOs...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🔍</span>
          <h3>{search ? "No NGOs match your search" : "No verified NGOs yet"}</h3>
          <p>{search ? "Try a different keyword" : "Check back after admin verification"}</p>
        </div>
      ) : (
        <>
          <p className="results-count">{filtered.length} NGO{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="card-grid">
            {filtered.map(ngo => (
              <Link key={ngo._id} to={`/ngos/${ngo._id}`} className="card ngo-card link-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div className="ngo-avatar" style={{ margin: 0, flexShrink: 0 }}>
                    {ngo.photo
                      ? <img src={`http://localhost:5000${ngo.photo}`} alt={ngo.name} className="ngo-photo" />
                      : ngo.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title" style={{ marginBottom: "0.1rem" }}>{ngo.name}</div>
                    {ngo.location && (
                      <span className="location-tag">📍 {ngo.location}</span>
                    )}
                  </div>
                </div>
                <p style={{ marginTop: "0.5rem" }}>{ngo.description
                  ? ngo.description.length > 110 ? ngo.description.slice(0, 110) + "..." : ngo.description
                  : "Dedicated to making a positive impact in the community."}</p>
                <div className="card-footer">
                  <span className="badge badge-green">✅ Verified</span>
                  <span className="chip">View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NGOListPage;
