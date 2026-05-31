const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  createOrder,
  verifyPayment,
  markPaymentFailed,
  getPaymentHistory,
  getNGODonations,
  getReceipt,
} = require("../controllers/paymentController");

// ── Donor routes ──────────────────────────────────────────────────
// POST /api/payment/create-order  — create Razorpay order (donors only)
router.post("/create-order",  protect, createOrder);

// POST /api/payment/verify       — verify payment after Razorpay callback
router.post("/verify",        protect, verifyPayment);

// POST /api/payment/failed       — mark payment as failed
router.post("/failed",        protect, markPaymentFailed);

// GET  /api/payment/history      — donor's own payment history
router.get("/history",        protect, getPaymentHistory);

// GET  /api/payment/receipt/:id  — single receipt for a paid donation
router.get("/receipt/:donationId", protect, getReceipt);

// ── NGO routes ────────────────────────────────────────────────────
// GET  /api/payment/ngo-donations — all donations received by the NGO
router.get("/ngo-donations",  protect, authorizeRoles("ngo", "admin"), getNGODonations);

module.exports = router;
