import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

const CATEGORIES = ["all","education","health","environment","food","animal","disaster","women","youth","other"];
const CAT_ICONS = { education:"📚", health:"🏥", environment:"🌿", food:"🍱", animal:"🐾", disaster:"🆘", women:"👩", youth:"👦", other:"🌐", all:"🔍" };

const NGOListPage = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ngo/all")
      .then(r => setNgos(r.data.ngos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = ngos.filter(n => {
    const matchCat = category === "all" || n.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || n.name.toLowerCase().includes(q) ||
      (n.description || "").toLowerCase().includes(q) ||
      (n.location || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏢 Verified NGOs</h1>
        <p>Trusted organisations making a difference across India</p>
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
        {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
      </div>

      {/* Category Filter Pills */}
      <div className="filter-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`pill ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line wide" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line narrow" />
              <div className="skeleton-footer">
                <div className="skeleton-badge" />
                <div className="skeleton-chip" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🔍</span>
          <h3>{search || category !== "all" ? "No NGOs match your filters" : "No verified NGOs yet"}</h3>
          <p>{search || category !== "all" ? "Try a different keyword or category" : "Check back after admin verification"}</p>
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
                      ? <img src={getImageUrl(ngo.photo)} alt={ngo.name} className="ngo-photo" />
                      : ngo.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title" style={{ marginBottom: "0.15rem" }}>{ngo.name}</div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                      {ngo.location && <span className="location-tag">📍 {ngo.location}</span>}
                      {ngo.category && ngo.category !== "other" && (
                        <span className="cat-badge" style={{ fontSize: "0.7rem" }}>
                          {CAT_ICONS[ngo.category]} {ngo.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: "0.5rem" }}>
                  {ngo.description
                    ? ngo.description.length > 100 ? ngo.description.slice(0, 100) + "..." : ngo.description
                    : "Dedicated to making a positive impact in the community."}
                </p>
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
