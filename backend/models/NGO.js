const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "NGO name is required"], trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    photo: { type: String }, // URL to uploaded image
    category: {
      type: String,
      enum: ["education", "health", "environment", "food", "animal", "disaster", "women", "youth", "other"],
      default: "other",
    },
    contact: { type: String, trim: true }, // email or phone
    website: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false }, // admin rejected flag
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "NGO must have a creator"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
