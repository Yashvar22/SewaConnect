import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import RazorpayDonationModal from "../components/RazorpayDonationModal";
import { getImageUrl } from "../utils/imageUrl";

/**
 * DonatePage
 * - Tab 1: Money Donations  → triggers Razorpay payment modal
 * - Tab 2: Item Donations   → form-based, stored directly
 * - Bottom: My Donation History (items + paid money donations)
 */
const DonatePage = () => {
  const [searchParams]    = useSearchParams();
  const preselectedNgoId  = searchParams.get("ngo") || "";

  const [ngos,           setNgos]           = useState([]);
  const [donationType,   setDonationType]   = useState("money"); // "money" | "item"
  const [myDonations,    setMyDonations]    = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message,        setMessage]        = useState("");
  const [error,          setError]          = useState("");
  const [showRazorpay,   setShowRazorpay]   = useState(false);
  const [selectedNgoId,  setSelectedNgoId]  = useState(preselectedNgoId);
  const [selectedNgoDetails, setSelectedNgoDetails] = useState(null);

  // Item form state
  const [itemForm, setItemForm] = useState({
    itemName:     "",
    description:  "",
    pickupOption: "pickup",
    pickupAddress:"",
    ngoId:        preselectedNgoId,
    image:        null,
  });
  const [preview, setPreview] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 4500);
  };

  /* ── Load NGOs + history on mount ─────────────────────────────── */
  useEffect(() => {
    api.get("/ngo/all")
      .then(r => setNgos(r.data.ngos || []))
      .catch(() => {});

    api.get("/donation/my")
      .then(r => setMyDonations(r.data.donations || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  /* ── Sync pre-selected NGO ───────────────────────────────────── */
  useEffect(() => {
    if (preselectedNgoId) {
      setItemForm(f => ({ ...f, ngoId: preselectedNgoId }));
      setSelectedNgoId(preselectedNgoId);
    }
  }, [preselectedNgoId]);

  /* ── Update selected NGO details when NGO selection changes ─── */
  useEffect(() => {
    if (selectedNgoId && ngos.length > 0) {
      const ngo = ngos.find(n => n._id === selectedNgoId);
      setSelectedNgoDetails(ngo || null);
    } else if (!selectedNgoId) {
      setSelectedNgoDetails(null);
    }
  }, [selectedNgoId, ngos]);

  /* ── Item image handling ──────────────────────────────────────── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm(f => ({ ...f, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  /* ── Item donation submit ─────────────────────────────────────── */
  const handleItemDonate = async (e) => {
    e.preventDefault();
    if (!itemForm.itemName) return flash("Item name is required", true);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type",         "item");
      fd.append("itemName",     itemForm.itemName);
      fd.append("description",  itemForm.description);
      fd.append("pickupOption", itemForm.pickupOption);
      fd.append("pickupAddress",itemForm.pickupAddress);
      if (itemForm.ngoId)  fd.append("ngoId", itemForm.ngoId);
      if (itemForm.image)  fd.append("image", itemForm.image);

      const { data } = await api.post("/donation/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      flash("Item donation submitted successfully! 🎉");
      setItemForm({ itemName:"", description:"", pickupOption:"pickup", pickupAddress:"", ngoId:"", image:null });
      setPreview(null);
      setMyDonations(prev => [data.donation, ...prev]);
    } catch (err) {
      flash(err.response?.data?.message || "Error submitting donation", true);
    } finally {
      setLoading(false);
    }
  };

  /* ── Razorpay success callback ────────────────────────────────── */
  const handlePaymentSuccess = (paidDonation) => {
    setMyDonations(prev => [paidDonation, ...prev.filter(d => d._id !== paidDonation._id)]);
    // modal stays open on success screen — user closes it manually
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  const preselectedNgo = preselectedNgoId ? ngos.find(n => n._id === preselectedNgoId) : null;

  return (
    <div className="page">
      {/* ── Razorpay Modal ── */}
      {showRazorpay && (
        <RazorpayDonationModal
          ngoId={selectedNgoId || undefined}
          ngoName={
            preselectedNgo?.name ||
            ngos.find(n => n._id === selectedNgoId)?.name ||
            undefined
          }
          onClose={() => setShowRazorpay(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1>💝 Make a Donation</h1>
        <p>Your generosity creates real impact in the community</p>
        {preselectedNgo && (
          <div className="alert success" style={{ marginTop:"1rem", display:"inline-flex" }}>
            ✅ Donating to: <strong style={{ marginLeft:"0.4rem" }}>{preselectedNgo.name}</strong>
          </div>
        )}
      </div>

      {message && <div className="alert success">{message}</div>}
      {error   && <div className="alert error">{error}</div>}

      {/* ── Donation Type Switcher ── */}
      <div className="type-switcher">
        <button
          className={`type-btn ${donationType === "money" ? "type-btn-active" : ""}`}
          onClick={() => setDonationType("money")}
        >
          💳 Donate Money
        </button>
        <button
          className={`type-btn ${donationType === "item" ? "type-btn-active" : ""}`}
          onClick={() => setDonationType("item")}
        >
          📦 Donate Items
        </button>
      </div>

      {/* ══════════════════════════════════════════
          MONEY DONATION — Razorpay
      ══════════════════════════════════════════ */}
      {donationType === "money" && (
        <div className="donate-card">
          <div className="rzp-promo-header">
            <div className="rzp-promo-icon">💳</div>
            <div>
              <h2>Online Money Donation</h2>
              <p className="section-sub">
                Secure, instant payments via Razorpay — UPI, Cards, Net Banking &amp; Wallets accepted.
              </p>
            </div>
          </div>

          {/* NGO selector */}
          {!preselectedNgoId && (
            <div className="form-group" style={{ maxWidth: 420 }}>
              <label>Select NGO <span style={{ color:"var(--text-dim)", fontSize:"0.8rem" }}>(optional)</span></label>
              <select
                id="money-ngo"
                value={selectedNgoId}
                onChange={(e) => setSelectedNgoId(e.target.value)}
              >
                <option value="">— General / Any NGO —</option>
                {ngos.map(n => (
                  <option key={n._id} value={n._id}>{n.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* NGO Bank / UPI Details Panel */}
          {selectedNgoDetails && (selectedNgoDetails.upiId || selectedNgoDetails.accountNumber) && (
            <div style={{
              background: "var(--bg3, #1e293b)",
              border: "1px solid var(--border, #334155)",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              maxWidth: 480,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🏦</span>
                <strong style={{ fontSize: "0.95rem" }}>Bank / UPI Details — {selectedNgoDetails.name}</strong>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: "0.75rem" }}>
                You can also transfer directly to the NGO using the details below.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.875rem" }}>
                {selectedNgoDetails.upiId && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 130 }}>📲 UPI ID</span>
                    <strong style={{ color: "var(--primary, #22c55e)", wordBreak: "break-all" }}>{selectedNgoDetails.upiId}</strong>
                  </div>
                )}
                {selectedNgoDetails.accountHolder && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 130 }}>👤 Account Name</span>
                    <strong>{selectedNgoDetails.accountHolder}</strong>
                  </div>
                )}
                {selectedNgoDetails.bankName && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 130 }}>🏛️ Bank</span>
                    <strong>{selectedNgoDetails.bankName}</strong>
                  </div>
                )}
                {selectedNgoDetails.accountNumber && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 130 }}>💳 Account No.</span>
                    <strong style={{ letterSpacing: "0.05em" }}>{selectedNgoDetails.accountNumber}</strong>
                  </div>
                )}
                {selectedNgoDetails.ifscCode && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 130 }}>🔢 IFSC Code</span>
                    <strong style={{ letterSpacing: "0.08em" }}>{selectedNgoDetails.ifscCode}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feature cards */}
          <div className="rzp-features">
            <div className="rzp-feature-card">
              <span>🔒</span>
              <div>
                <strong>Bank-Level Security</strong>
                <p>256-bit SSL encryption on every transaction</p>
              </div>
            </div>
            <div className="rzp-feature-card">
              <span>⚡</span>
              <div>
                <strong>Instant Processing</strong>
                <p>Payment confirmed in real-time with receipt</p>
              </div>
            </div>
            <div className="rzp-feature-card">
              <span>📜</span>
              <div>
                <strong>Download Receipt</strong>
                <p>Get a detailed receipt for every donation</p>
              </div>
            </div>
            <div className="rzp-feature-card">
              <span>💼</span>
              <div>
                <strong>Multiple Methods</strong>
                <p>UPI · Cards · Net Banking · Wallets</p>
              </div>
            </div>
          </div>

          <button
            id="open-razorpay-btn"
            className="btn-primary rzp-open-btn"
            onClick={() => setShowRazorpay(true)}
          >
            💳 Proceed to Secure Payment
          </button>

          <p className="rzp-footer-note" style={{ marginTop:"1rem" }}>
            🔒 Powered by Razorpay · PCI-DSS Compliant · Trusted by 8M+ businesses
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ITEM DONATION
      ══════════════════════════════════════════ */}
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
                  <option value="">— Any NGO —</option>
                  {ngos.map(n => <option key={n._id} value={n._id}>{n.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                id="item-desc"
                placeholder="Describe item condition, quantity, etc."
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
              <label>Upload Item Image (optional)</label>
              <div
                className="image-upload-area"
                onClick={() => document.getElementById("item-image-input").click()}
              >
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
              {loading ? (
                <span className="btn-loading"><span className="btn-spinner" />Submitting...</span>
              ) : "📦 Submit Item Donation"}
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DONATION HISTORY
      ══════════════════════════════════════════ */}
      <div className="dashboard-section" style={{ marginTop: "3rem" }}>
        <h2>📋 My Donation History</h2>
        {historyLoading ? (
          <div className="loading">
            <div className="spinner-ring" style={{ margin:"0 auto 1rem" }} />
            Loading history...
          </div>
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
                  <strong>{d.type === "money" ? `₹${d.amount?.toLocaleString("en-IN")}` : d.itemName}</strong>
                  <span>{d.description || "No description"}</span>
                  {d.ngoId && <span className="donation-ngo">→ {d.ngoId.name}</span>}
                </div>
                <div className="donation-meta">
                  {/* payment status badge for money donations */}
                  {d.type === "money" ? (
                    <span className={`badge ${
                      d.paymentStatus === "paid"   ? "badge-green" :
                      d.paymentStatus === "failed" ? "badge-red"   : "badge-amber"
                    }`}>
                      {d.paymentStatus === "paid"   ? "✅ Paid" :
                       d.paymentStatus === "failed" ? "❌ Failed" : "⏳ Pending"}
                    </span>
                  ) : (
                    <span className="badge badge-blue">📦 Item</span>
                  )}
                  {d.type === "item" && (
                    <span className="badge badge-amber">
                      {d.pickupOption === "pickup" ? "🚗 Pickup" : "🏬 Drop-off"}
                    </span>
                  )}
                  <small>{formatDate(d.createdAt)}</small>
                </div>
                {d.image && (
                  <img
                    src={getImageUrl(d.image)}
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
