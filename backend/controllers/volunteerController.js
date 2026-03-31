const Volunteer = require("../models/Volunteer");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Apply as volunteer for an event
// @route   POST /api/volunteer/apply
const applyForEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
      return res.status(400).json({ message: "userId and eventId are required" });
    }

    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check for duplicate application (compound index will also catch this)
    const existing = await Volunteer.findOne({ userId, eventId });
    if (existing) {
      return res.status(409).json({
        message: "You have already applied for this event",
        application: existing,
      });
    }

    const application = await Volunteer.create({ userId, eventId });

    res.status(201).json({
      message: "Volunteer application submitted ✅ Status: pending",
      application,
    });
  } catch (error) {
    // Handle Mongoose duplicate key error as backup
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already applied for this event" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all events a user has applied for
// @route   GET /api/volunteer/my/:userId
const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const applications = await Volunteer.find({ userId })
      .populate("eventId", "title description date ngoId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `Applications for ${user.name}`,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve a volunteer (NGO approves)
// @route   PUT /api/volunteer/approve/:id
const approveVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Volunteer.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "approved") {
      return res.status(400).json({ message: "Application already approved" });
    }

    application.status = "approved";
    await application.save();

    res.status(200).json({
      message: "Volunteer approved ✅",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get applications for the auth'd user (JWT-based)
// @route   GET /api/volunteer/my
const getMyApplications = async (req, res) => {
  try {
    const applications = await Volunteer.find({ userId: req.user._id })
      .populate({ path: "eventId", select: "title description date", populate: { path: "ngoId", select: "name" } })
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Your applications", count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all volunteers for a specific event (NGO use)
// @route   GET /api/volunteer/event/:eventId
const getVolunteersForEvent = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ eventId: req.params.eventId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: volunteers.length, volunteers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { applyForEvent, getUserApplications, approveVolunteer, getMyApplications, getVolunteersForEvent };
