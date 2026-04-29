import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet default icon broken by Vite/webpack asset bundling ────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom vivid marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper: fly to new coords when they change
const FlyTo = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { animate: true, duration: 1.2 });
  }, [coords, map]);
  return null;
};

// ── Main MapView Component ────────────────────────────────────────────────────
// Props:
//   location  – string  – location text to geocode (e.g. "Mumbai, Maharashtra")
//   label     – string  – popup label shown on marker click
//   height    – string  – CSS height of the map (default "300px")
const MapView = ({ location, label, height = "300px" }) => {
  const [coords, setCoords] = useState(null);      // [lat, lng]
  const [geoError, setGeoError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) return;
    setGeoError(false);
    setLoading(true);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;

    fetch(url, { headers: { "Accept-Language": "en" } })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setGeoError(true);
        }
      })
      .catch(() => setGeoError(true))
      .finally(() => setLoading(false));
  }, [location]);

  // Don't render if no location provided
  if (!location) return null;

  return (
    <div className="map-wrapper" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", position: "relative", height }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "var(--bg2)", gap: "0.5rem",
        }}>
          <div className="spinner-ring" />
          <small style={{ color: "var(--text-muted)" }}>Loading map for "{location}"…</small>
        </div>
      )}

      {geoError && !loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "var(--bg2)", gap: "0.5rem",
        }}>
          <span style={{ fontSize: "2rem" }}>🗺️</span>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            Could not find map for <strong>"{location}"</strong>
          </p>
          <small style={{ color: "var(--text-dim)" }}>Try a more specific location name</small>
        </div>
      )}

      {/* Default India center until geocoding resolves */}
      <MapContainer
        center={coords || [20.5937, 78.9629]}
        zoom={coords ? 13 : 5}
        style={{ height, width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coords && (
          <>
            <FlyTo coords={coords} />
            <Marker position={coords} icon={customIcon}>
              <Popup>
                <strong>{label || location}</strong>
                <br />
                <small style={{ color: "#666" }}>📍 {location}</small>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
