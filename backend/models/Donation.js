const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["money", "item"],
      default: "item",
    },
    // Item donation fields
    itemName: { type: String, trim: true },
    image: { type: String }, // URL to uploaded image
    pickupOption: {
      type: String,
      enum: ["pickup", "drop"],
      default: "pickup",
    },
    // Money donation field
    amount: { type: Number, min: 0 },
    // Shared fields
    description: { type: String, trim: true },
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
