const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer must be a registered user"],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Volunteer must apply for an event"],
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending", // All applications start as pending
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate applications (same user + same event)
volunteerSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Volunteer", volunteerSchema);
