const Razorpay = require("razorpay");
const crypto  = require("crypto");
const Donation = require("../models/Donation");
const NGO      = require("../models/NGO");

// ── Initialise Razorpay ────────────────────────────────────────────────────
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.");
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ── Helper: generate a short receipt ID ───────────────────────────────────
const generateReceiptId = () =>
  `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Creates a Razorpay order and a pending Donation record.
// Body: { amount, ngoId?, description? }
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { amount, ngoId, description } = req.body;
    const donorId = req.user._id;

    // ── Validate amount ────────────────────────────────────────────
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1) {
      return res.status(400).json({ message: "A valid amount (≥ ₹1) is required" });
    }
    if (parsedAmount > 500000) {
      return res.status(400).json({ message: "Maximum donation per transaction is ₹5,00,000" });
    }

    // ── Validate ngoId if provided ─────────────────────────────────
    if (ngoId) {
      const ngo = await NGO.findById(ngoId);
      if (!ngo) return res.status(404).json({ message: "NGO not found" });
      if (!ngo.verified) return res.status(400).json({ message: "Cannot donate to an unverified NGO" });
    }

    const receiptId = generateReceiptId();
    const razorpay  = getRazorpay();

    // ── Create Razorpay order (amount in paise) ────────────────────
    const order = await razorpay.orders.create({
      amount:   Math.round(parsedAmount * 100), // paise
      currency: "INR",
      receipt:  receiptId,
      notes: {
        donorId:  donorId.toString(),
        ngoId:    ngoId   || "general",
        platform: "SewaConnect",
      },
    });

    // ── Persist a pending Donation record ──────────────────────────
    const donation = await Donation.create({
      type:            "money",
      amount:          parsedAmount,
      description:     description || "",
      donorId,
      ngoId:           ngoId || undefined,
      razorpayOrderId: order.id,
      paymentStatus:   "pending",
      receiptId,
    });

    res.status(201).json({
      message:    "Order created",
      orderId:    order.id,
      amount:     order.amount,          // paise
      currency:   order.currency,
      receiptId,
      donationId: donation._id,
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[Payment] createOrder error:", error.message);
    if (error.message.includes("Razorpay keys")) {
      return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: "Could not create payment order", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Verifies Razorpay signature & marks donation as paid.
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId }
// ─────────────────────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donationId) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // ── Cryptographic signature check ─────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark the donation as failed for audit trail
      await Donation.findByIdAndUpdate(donationId, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Payment verification failed — invalid signature" });
    }

    // ── Update Donation record as paid ────────────────────────────
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus:     "paid",
      },
      { new: true }
    ).populate("ngoId", "name").populate("donorId", "name email");

    if (!donation) {
      return res.status(404).json({ message: "Donation record not found" });
    }

    res.status(200).json({
      message:   "Payment verified & donation recorded ✅",
      donation,
    });
  } catch (error) {
    console.error("[Payment] verifyPayment error:", error.message);
    res.status(500).json({ message: "Payment verification error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/failed
// Client-side failure handler — marks pending donation as failed.
// Body: { donationId, razorpay_order_id }
// ─────────────────────────────────────────────────────────────────────────────
const markPaymentFailed = async (req, res) => {
  try {
    const { donationId } = req.body;
    if (donationId) {
      await Donation.findByIdAndUpdate(donationId, { paymentStatus: "failed" });
    }
    res.status(200).json({ message: "Payment marked as failed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/history
// Returns the current donor's paid money donations.
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentHistory = async (req, res) => {
  try {
    const donations = await Donation.find({
      donorId:       req.user._id,
      type:          "money",
      paymentStatus: "paid",
    })
      .populate("ngoId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message:   "Payment history fetched",
      count:     donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/ngo-donations
// Returns all paid donations received by the NGO associated with the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
const getNGODonations = async (req, res) => {
  try {
    const NGOModel = require("../models/NGO");
    const ngo = await NGOModel.findOne({ createdBy: req.user._id });
    if (!ngo) return res.status(404).json({ message: "No NGO found for your account" });

    const donations = await Donation.find({
      ngoId:         ngo._id,
      type:          "money",
      paymentStatus: "paid",
    })
      .populate("donorId", "name email")
      .sort({ createdAt: -1 });

    const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    res.status(200).json({
      message:   "NGO donations fetched",
      count:     donations.length,
      total,
      donations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/receipt/:donationId
// Returns a single paid donation for receipt display.
// ─────────────────────────────────────────────────────────────────────────────
const getReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id:           req.params.donationId,
      donorId:       req.user._id,
      paymentStatus: "paid",
    })
      .populate("ngoId",    "name location contact")
      .populate("donorId",  "name email");

    if (!donation) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json({ donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  markPaymentFailed,
  getPaymentHistory,
  getNGODonations,
  getReceipt,
};
