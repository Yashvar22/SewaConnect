const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["money", "item"],
      default: "item",
    },

    // ── Item donation fields ──────────────────────────────────────
    itemName:     { type: String, trim: true },
    image:        { type: String },            // Cloudinary URL
    pickupOption: { type: String, enum: ["pickup", "drop"], default: "pickup" },

    // ── Money donation fields ─────────────────────────────────────
    amount: { type: Number, min: 0 },

    // ── Razorpay payment fields ───────────────────────────────────
    razorpayOrderId:   { type: String },   // from createOrder
    razorpayPaymentId: { type: String },   // from client after payment
    razorpaySignature: { type: String },   // for server-side verification
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    receiptId: { type: String }, // unique per-donation receipt string

    // ── Shared fields ─────────────────────────────────────────────
    description:   { type: String, trim: true },
    pickupAddress: { type: String, trim: true },

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donation must have a donor"],
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
