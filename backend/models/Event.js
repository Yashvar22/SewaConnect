const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    maxVolunteers: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: [true, "Event must belong to an NGO"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
