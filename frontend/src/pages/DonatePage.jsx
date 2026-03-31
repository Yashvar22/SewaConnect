import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const DonatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [donationType, setDonationType] = useState("item"); // "money" | "item"
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Item form
  const [itemForm, setItemForm] = useState({
    itemName: "",
    description: "",
    pickupOption: "pickup",
    pickupAddress: "",
    ngoId: "",
    image: null,
  });

  // Money form
  const [moneyForm, setMoneyForm] = useState({
    amount: "",
    description: "",
    ngoId: "",
  });

  const [preview, setPreview] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 4000);
  };

  useEffect(() => {
    api.get("/ngo/all").then(r => setNgos(r.data.ngos)).catch(() => {});
    api.get("/donation/my")
      .then(r => setMyDonations(r.data.donations))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm(f => ({ ...f, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleItemDonate = async (e) => {
    e.preventDefault();
    if (!itemForm.itemName) return flash("Item name is required", true);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", "item");
      fd.append("itemName", itemForm.itemName);
      fd.append("description", itemForm.description);
      fd.append("pickupOption", itemForm.pickupOption);
      fd.append("pickupAddress", itemForm.pickupAddress);
      if (itemForm.ngoId) fd.append("ngoId", itemForm.ngoId);
      if (itemForm.image) fd.append("image", itemForm.image);

      const { data } = await api.post("/donation/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      flash("Item donation submitted successfully! 🎉");
      setItemForm({ itemName: "", description: "", pickupOption: "pickup", pickupAddress: "", ngoId: "", image: null });
      setPreview(null);
      setMyDonations(prev => [data.donation, ...prev]);
    } catch (err) {
      flash(err.response?.data?.message || "Error submitting donation", true);
    } finally {
      setLoading(false);
    }
  };

  const handleMoneyDonate = async (e) => {
    e.preventDefault();
    if (!moneyForm.amount || Number(moneyForm.amount) <= 0) return flash("Enter a valid amount", true);
    setLoading(true);
    try {
      const { data } = await api.post("/donation/create", {
        type: "money",
        amount: Number(moneyForm.amount),
        description: moneyForm.description,
        ngoId: moneyForm.ngoId || undefined,
      });
      flash("Money donation recorded successfully! 💚");
      setMoneyForm({ amount: "", description: "", ngoId: "" });
      setMyDonations(prev => [data.donation, ...prev]);
    } catch (err) {
      flash(err.response?.data?.message || "Error submitting donation", true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="page">
      <div className="page-header">
        <h1>💝 Make a Donation</h1>
        <p>Your generosity creates real impact in the community</p>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Donation Type Switcher */}
      <div className="type-switcher">
        <button
          className={`type-btn ${donationType === "item" ? "type-btn-active" : ""}`}
          onClick={() => setDonationType("item")}
        >
          📦 Donate Items
        </button>
        <button
          className={`type-btn ${donationType === "money" ? "type-btn-active" : ""}`}
          onClick={() => setDonationType("money")}
        >
          💵 Donate Money
        </button>
      </div>

      {/* ── ITEM DONATION ── */}
      {donationType === "item" && (
        <div className="donate-card">
          <h2>📦 Item Donation</h2>
          <p className="section-sub">Donate clothes, books, food, or any useful items to an NGO.</p>
          <form onSubmit={handleItemDonate} className="donate-form">
            <div className="form-row">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  id="item-name"
                  placeholder="e.g., Winter Clothes, Books"
                  value={itemForm.itemName}
                  onChange={e => setItemForm(f => ({ ...f, itemName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Select NGO (optional)</label>
                <select
                  id="item-ngo"
                  value={itemForm.ngoId}
                  onChange={e => setItemForm(f => ({ ...f, ngoId: e.target.value }))}
                >
                  <option value="">-- Any NGO --</option>
                  {ngos.map(n => <option key={n._id} value={n._id}>{n.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                id="item-desc"
                placeholder="Describe the item condition, quantity, etc."
                value={itemForm.description}
                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pickup / Drop-off</label>
                <select
                  id="item-pickup"
                  value={itemForm.pickupOption}
                  onChange={e => setItemForm(f => ({ ...f, pickupOption: e.target.value }))}
                >
                  <option value="pickup">🚗 NGO Picks Up</option>
                  <option value="drop">🏬 I'll Drop Off</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {itemForm.pickupOption === "pickup" ? "Your Pickup Address" : "Drop-off Location"}
                </label>
                <input
                  id="item-address"
                  placeholder="Enter address..."
                  value={itemForm.pickupAddress}
                  onChange={e => setItemForm(f => ({ ...f, pickupAddress: e.target.value }))}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Upload Item Image</label>
              <div className="image-upload-area" onClick={() => document.getElementById("item-image-input").click()}>
                {preview ? (
                  <img src={preview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span>📷</span>
                    <p>Click to upload an image</p>
                    <small>JPG, PNG, WEBP (max 5MB)</small>
                  </div>
                )}
              </div>
              <input
                id="item-image-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {preview && (
                <button
                  type="button"
                  className="btn-danger-sm"
                  onClick={() => { setPreview(null); setItemForm(f => ({ ...f, image: null })); }}
                >
                  ✕ Remove Image
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "📦 Submit Item Donation"}
            </button>
          </form>
        </div>
      )}

      {/* ── MONEY DONATION ── */}
      {donationType === "money" && (
        <div className="donate-card">
          <h2>💵 Money Donation</h2>
          <p className="section-sub">Your financial contribution helps NGOs run programs and events.</p>
          <form onSubmit={handleMoneyDonate} className="donate-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  id="money-amount"
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                  value={moneyForm.amount}
                  onChange={e => setMoneyForm(f => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Select NGO (optional)</label>
                <select
                  id="money-ngo"
                  value={moneyForm.ngoId}
                  onChange={e => setMoneyForm(f => ({ ...f, ngoId: e.target.value }))}
                >
                  <option value="">-- Any NGO --</option>
                  {ngos.map(n => <option key={n._id} value={n._id}>{n.name}</option>)}
                </select>
              </div>
            </div>

            {/* Quick amount buttons */}
            <div className="quick-amounts">
              {[100, 250, 500, 1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={`quick-btn ${Number(moneyForm.amount) === amt ? "quick-btn-active" : ""}`}
                  onClick={() => setMoneyForm(f => ({ ...f, amount: String(amt) }))}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Message / Purpose (optional)</label>
              <textarea
                id="money-desc"
                placeholder="e.g., For child education programs..."
                value={moneyForm.description}
                onChange={e => setMoneyForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processing..." : "💵 Confirm Donation"}
            </button>
          </form>
        </div>
      )}

      {/* ── DONATION HISTORY ── */}
      <div className="dashboard-section" style={{ marginTop: "3rem" }}>
        <h2>📋 My Donation History</h2>
        {historyLoading ? (
          <div className="loading">Loading history...</div>
        ) : myDonations.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <h3>No donations yet</h3>
            <p>Your donation history will appear here</p>
          </div>
        ) : (
          <div className="donation-history">
            {myDonations.map(d => (
              <div key={d._id} className="donation-row">
                <div className="donation-icon">
                  {d.type === "money" ? "💵" : "📦"}
                </div>
                <div className="donation-info">
                  <strong>{d.type === "money" ? `₹${d.amount}` : d.itemName}</strong>
                  <span>{d.description || "No description"}</span>
                  {d.ngoId && <span className="donation-ngo">→ {d.ngoId.name}</span>}
                </div>
                <div className="donation-meta">
                  <span className={`badge ${d.type === "money" ? "badge-green" : "badge-blue"}`}>
                    {d.type === "money" ? "💵 Money" : "📦 Item"}
                  </span>
                  {d.type === "item" && (
                    <span className="badge badge-amber">
                      {d.pickupOption === "pickup" ? "🚗 Pickup" : "🏬 Drop-off"}
                    </span>
                  )}
                  <small>{formatDate(d.createdAt)}</small>
                </div>
                {d.image && (
                  <img
                    src={`http://localhost:5000${d.image}`}
                    alt="Donated item"
                    className="donation-thumb"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonatePage;
