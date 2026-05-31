/**
 * RazorpayDonationModal.jsx
 * Premium, animated donation modal with Razorpay integration.
 * Props:
 *   - ngoId?        : string — pre-select an NGO
 *   - ngoName?      : string — display name for the NGO
 *   - onClose()     : called when the modal should be dismissed
 *   - onSuccess(donation) : called with the confirmed donation record
 */

import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── utility ────────────────────────────────────────────────────── */
const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

/* ── Load Razorpay checkout.js once ──────────────────────────────── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
════════════════════════════════════════════════════════════════════ */
const SuccessScreen = ({ donation, onClose }) => {
  const handleDownloadReceipt = () => {
    const receiptLines = [
      "======================================",
      "       SewaConnect — Donation Receipt",
      "======================================",
      `Receipt ID   : ${donation.receiptId || donation._id}`,
      `Payment ID   : ${donation.razorpayPaymentId || "—"}`,
      `Date         : ${new Date(donation.createdAt).toLocaleString("en-IN")}`,
      "--------------------------------------",
      `Donor        : ${donation.donorId?.name || "You"}`,
      `Email        : ${donation.donorId?.email || ""}`,
      "--------------------------------------",
      `NGO          : ${donation.ngoId?.name || "General Fund"}`,
      `Amount       : ₹${fmt(donation.amount)}`,
      `Status       : PAID ✅`,
      "======================================",
      "  Thank you for your generous support!",
      "  Your contribution makes a difference.",
      "======================================",
    ].join("\n");

    const blob = new Blob([receiptLines], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `SewaConnect_Receipt_${donation.receiptId || donation._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rzp-success-screen">
      <div className="rzp-success-icon">
        <svg viewBox="0 0 52 52" className="rzp-checkmark">
          <circle className="rzp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path  className="rzp-checkmark-check"  fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      <h2 className="rzp-success-title">Donation Successful! 🎉</h2>
      <p className="rzp-success-sub">
        Thank you for donating <strong>₹{fmt(donation.amount)}</strong>
        {donation.ngoId?.name && <> to <strong>{donation.ngoId.name}</strong></>}.
        Your generosity makes a real difference.
      </p>
      <div className="rzp-receipt-box">
        <div className="rzp-receipt-row"><span>Receipt ID</span>   <strong>{donation.receiptId || donation._id}</strong></div>
        <div className="rzp-receipt-row"><span>Payment ID</span>   <strong>{donation.razorpayPaymentId}</strong></div>
        <div className="rzp-receipt-row"><span>Amount</span>       <strong className="rzp-amount-big">₹{fmt(donation.amount)}</strong></div>
        <div className="rzp-receipt-row"><span>NGO</span>          <strong>{donation.ngoId?.name || "General Fund"}</strong></div>
        <div className="rzp-receipt-row"><span>Date</span>         <strong>{new Date(donation.createdAt).toLocaleString("en-IN")}</strong></div>
        <div className="rzp-receipt-row"><span>Status</span>       <span className="badge badge-green">✅ PAID</span></div>
      </div>
      <div className="rzp-action-row">
        <button className="btn-primary rzp-btn" onClick={handleDownloadReceipt}>
          📄 Download Receipt
        </button>
        <button className="btn-sm rzp-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   FAILURE SCREEN
════════════════════════════════════════════════════════════════════ */
const FailureScreen = ({ onRetry, onClose }) => (
  <div className="rzp-success-screen">
    <div className="rzp-failure-icon">❌</div>
    <h2 className="rzp-success-title" style={{ color: "var(--danger, #ef4444)" }}>
      Payment Failed
    </h2>
    <p className="rzp-success-sub">
      Your payment could not be processed. No money has been deducted.
      Please try again or use a different payment method.
    </p>
    <div className="rzp-action-row">
      <button className="btn-primary rzp-btn" onClick={onRetry}>🔄 Try Again</button>
      <button className="btn-sm rzp-btn" onClick={onClose}>Cancel</button>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════════════════════════════════ */
const RazorpayDonationModal = ({ ngoId, ngoName, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [ngos,       setNgos]       = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(ngoId || "");
  const [amount,     setAmount]     = useState("");
  const [description, setDescription] = useState("");
  const [step,       setStep]       = useState("form"); // form | processing | success | failed
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [paidDonation, setPaidDonation] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Preload Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().then(setScriptLoaded);
    if (!ngoId) {
      api.get("/ngo/all").then(r => setNgos(r.data.ngos || [])).catch(() => {});
    }
  }, [ngoId]);

  const handleQuickAmount = (amt) => setAmount(String(amt));

  const handleDonate = useCallback(async () => {
    const parsedAmt = Number(amount);
    if (!parsedAmt || parsedAmt < 1) {
      setError("Please enter a valid amount (minimum ₹1)");
      return;
    }
    if (!scriptLoaded) {
      setError("Payment gateway is loading, please wait a moment and try again.");
      return;
    }

    setError("");
    setLoading(true);
    setStep("processing");

    let donationId = null;

    try {
      // 1. Create backend order
      const { data: orderData } = await api.post("/payment/create-order", {
        amount:      parsedAmt,
        ngoId:       selectedNgo || undefined,
        description: description || undefined,
      });
      donationId = orderData.donationId;

      const keyId = orderData.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      // 2. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key:         keyId,
          amount:      orderData.amount,   // paise
          currency:    orderData.currency,
          name:        "SewaConnect",
          description: `Donation${ngoName ? ` to ${ngoName}` : ""}`,
          order_id:    orderData.orderId,
          prefill: {
            name:  user?.name  || "",
            email: user?.email || "",
          },
          theme: { color: "#16a34a" },
          modal: {
            ondismiss: () => reject(new Error("DISMISSED")),
          },
          handler: (response) => resolve(response),
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => reject(new Error("PAYMENT_FAILED")));
        rzp.open();
      });
    } catch (err) {
      // Payment dismissed or failed
      if (donationId) {
        api.post("/payment/failed", { donationId }).catch(() => {});
      }
      if (err.message === "DISMISSED") {
        setStep("form");
        setLoading(false);
        return;
      }
      setStep("failed");
      setLoading(false);
      return;
    }

    // We land here only if the handler resolved (payment success on Razorpay side)
    // But we need the response — re-structure using a ref approach:
    // Since the handler already fired, we must re-run the flow with proper capture.
    // The pattern above resolves with the Razorpay response object.
    // Re-implement cleanly:
    setLoading(false);
  }, [amount, selectedNgo, description, scriptLoaded, user, ngoName]);

  // ── Cleaner implementation using useCallback with proper Promise capture ──
  const initiateDonation = useCallback(async () => {
    const parsedAmt = Number(amount);
    if (!parsedAmt || parsedAmt < 1) {
      setError("Please enter a valid amount (minimum ₹1)");
      return;
    }
    if (!scriptLoaded) {
      setError("Payment gateway is loading. Please wait and try again.");
      return;
    }

    setError("");
    setLoading(true);
    setStep("processing");

    let donationId = null;

    try {
      // Step 1 — create order on server
      const { data: orderData } = await api.post("/payment/create-order", {
        amount:      parsedAmt,
        ngoId:       selectedNgo || undefined,
        description: description || undefined,
      });
      donationId = orderData.donationId;

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // Step 2 — open Razorpay modal and wait for result
      const rzpResponse = await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         keyId,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        "SewaConnect",
          description: `Donation${ngoName ? ` to ${ngoName}` : ""}`,
          order_id:    orderData.orderId,
          prefill: {
            name:  user?.name  || "",
            email: user?.email || "",
          },
          theme: { color: "#16a34a" },
          modal: { ondismiss: () => reject(new Error("DISMISSED")) },
          handler: (res) => resolve(res),
        });
        rzp.on("payment.failed", () => reject(new Error("PAYMENT_FAILED")));
        rzp.open();
      });

      // Step 3 — verify on server
      const { data: verifyData } = await api.post("/payment/verify", {
        razorpay_order_id:   rzpResponse.razorpay_order_id,
        razorpay_payment_id: rzpResponse.razorpay_payment_id,
        razorpay_signature:  rzpResponse.razorpay_signature,
        donationId,
      });

      setPaidDonation(verifyData.donation);
      setStep("success");
      onSuccess && onSuccess(verifyData.donation);

    } catch (err) {
      if (donationId) {
        api.post("/payment/failed", { donationId }).catch(() => {});
      }
      if (err.message === "DISMISSED") {
        setStep("form");
      } else {
        setStep("failed");
      }
    } finally {
      setLoading(false);
    }
  }, [amount, selectedNgo, description, scriptLoaded, user, ngoName, onSuccess]);

  const handleRetry = () => {
    setStep("form");
    setError("");
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={step === "form" ? onClose : undefined}>
      <div
        className="rzp-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Donation payment modal"
      >
        {/* Header */}
        {step !== "success" && step !== "failed" && (
          <div className="rzp-modal-header">
            <div className="rzp-header-left">
              <span className="rzp-logo-icon">💚</span>
              <div>
                <h2 className="rzp-modal-title">Make a Donation</h2>
                {(ngoName || selectedNgo) && (
                  <p className="rzp-modal-sub">
                    {ngoName
                      ? `Donating to ${ngoName}`
                      : ngos.find(n => n._id === selectedNgo)?.name
                        ? `Donating to ${ngos.find(n => n._id === selectedNgo).name}`
                        : "Supporting any NGO"}
                  </p>
                )}
              </div>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        )}

        {/* ── Form Step ── */}
        {step === "form" && (
          <div className="rzp-form-body">
            {error && <div className="alert error" style={{ marginBottom: "1rem" }}>{error}</div>}

            {/* NGO selector (only when not pre-selected) */}
            {!ngoId && (
              <div className="form-group">
                <label>Select NGO <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>(optional)</span></label>
                <select
                  id="rzp-ngo-select"
                  value={selectedNgo}
                  onChange={(e) => setSelectedNgo(e.target.value)}
                >
                  <option value="">— General / Any NGO —</option>
                  {ngos.map((n) => (
                    <option key={n._id} value={n._id}>{n.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick amount buttons */}
            <div className="form-group">
              <label>Select Amount</label>
              <div className="quick-amounts">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`quick-btn ${Number(amount) === amt ? "quick-btn-active" : ""}`}
                    onClick={() => handleQuickAmount(amt)}
                  >
                    ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount input */}
            <div className="form-group">
              <label>
                Or enter custom amount <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>(₹)</span>
              </label>
              <div className="rzp-amount-input-wrap">
                <span className="rzp-currency-symbol">₹</span>
                <input
                  id="rzp-amount-input"
                  type="number"
                  min="1"
                  max="500000"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rzp-amount-input"
                />
              </div>
              {amount && Number(amount) > 0 && (
                <small className="rzp-amount-preview">
                  You are donating ₹{fmt(Number(amount))}
                </small>
              )}
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>(optional)</span></label>
              <textarea
                id="rzp-message"
                placeholder="e.g., For child education programs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Trust badges */}
            <div className="rzp-trust-row">
              <span>🔒 SSL Secure</span>
              <span>🏦 100% Safe</span>
              <span>📜 Tax Deductible</span>
            </div>

            {/* Pay button */}
            <button
              id="rzp-pay-btn"
              className="btn-primary rzp-pay-button"
              disabled={loading || !amount || Number(amount) < 1}
              onClick={initiateDonation}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  Processing...
                </span>
              ) : (
                <>💳 Pay ₹{amount && Number(amount) > 0 ? fmt(Number(amount)) : "—"} Securely</>
              )}
            </button>

            <p className="rzp-footer-note">
              Powered by <strong>Razorpay</strong> · UPI · Cards · Net Banking · Wallets
            </p>
          </div>
        )}

        {/* ── Processing Step ── */}
        {step === "processing" && (
          <div className="rzp-processing">
            <div className="rzp-processing-spinner" />
            <h3>Processing Payment...</h3>
            <p>Please complete the payment in the Razorpay window.</p>
            <small>Do not close this window.</small>
          </div>
        )}

        {/* ── Success Step ── */}
        {step === "success" && paidDonation && (
          <SuccessScreen donation={paidDonation} onClose={onClose} />
        )}

        {/* ── Failed Step ── */}
        {step === "failed" && (
          <FailureScreen onRetry={handleRetry} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default RazorpayDonationModal;
