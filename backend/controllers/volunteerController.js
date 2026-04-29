const Volunteer = require("../models/Volunteer");
const Event = require("../models/Event");
const User = require("../models/User");
const NGO = require("../models/NGO");
const {
  sendNewVolunteerApplicationEmail,
  sendVolunteerApprovedEmail,
  sendVolunteerRejectedEmail,
} = require("../utils/emailService");

// @desc    Apply as volunteer for an event
// @route   POST /api/volunteer/apply
// Security: use the JWT userId (req.user._id), ignore any userId passed in body
const applyForEvent = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT — do NOT trust body userId
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    // Check event exists (populate ngoId so we can email the NGO owner)
    const event = await Event.findById(eventId).populate({
      path: "ngoId",
      select: "name createdBy",
      populate: { path: "createdBy", select: "name email" },
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check for duplicate application
    const existing = await Volunteer.findOne({ userId, eventId });
    if (existing) {
      return res.status(409).json({
        message: "You have already applied for this event",
        application: existing,
      });
    }

    const application = await Volunteer.create({ userId, eventId });

    // Notify NGO owner about new application (fire-and-forget)
    const ngoOwner = event.ngoId?.createdBy;
    if (ngoOwner?.email) {
      sendNewVolunteerApplicationEmail({
        to: ngoOwner.email,
        ngoName: event.ngoId.name,
        eventTitle: event.title,
        volunteerName: req.user.name,
        volunteerEmail: req.user.email,
      });
    }

    res.status(201).json({
      message: "Volunteer application submitted ✅ Status: pending",
      application,
    });
  } catch (error) {
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

    const application = await Volunteer.findById(id)
      .populate("userId", "name email")
      .populate({
        path: "eventId",
        select: "title date location",
        populate: { path: "ngoId", select: "name" },
      });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "approved") {
      return res.status(400).json({ message: "Application already approved" });
    }

    application.status = "approved";
    await application.save();

    // Notify volunteer (fire-and-forget)
    if (application.userId?.email) {
      sendVolunteerApprovedEmail({
        to: application.userId.email,
        volunteerName: application.userId.name || "Volunteer",
        eventTitle: application.eventId?.title || "Event",
        ngoName: application.eventId?.ngoId?.name || "the NGO",
        eventDate: application.eventId?.date,
        eventLocation: application.eventId?.location,
      });
    }

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
      .populate({
        path: "eventId",
        select: "title description date location",
        populate: { path: "ngoId", select: "name _id" }
      })
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

// @desc    Reject / remove a volunteer application
// @route   PUT /api/volunteer/reject/:id
const rejectVolunteer = async (req, res) => {
  try {
    const application = await Volunteer.findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path: "eventId",
        select: "title",
        populate: { path: "ngoId", select: "name" },
      });
    if (!application) return res.status(404).json({ message: "Application not found" });
    application.status = "rejected";
    await application.save();

    // Notify volunteer (fire-and-forget)
    if (application.userId?.email) {
      sendVolunteerRejectedEmail({
        to: application.userId.email,
        volunteerName: application.userId.name || "Volunteer",
        eventTitle: application.eventId?.title || "Event",
        ngoName: application.eventId?.ngoId?.name || "the NGO",
      });
    }

    res.status(200).json({ message: "Application rejected", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete / withdraw a volunteer application (user withdraws their own)
// @route   DELETE /api/volunteer/:id
const withdrawApplication = async (req, res) => {
  try {
    const application = await Volunteer.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to withdraw this application" });
    }
    await Volunteer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { applyForEvent, getUserApplications, approveVolunteer, rejectVolunteer, withdrawApplication, getMyApplications, getVolunteersForEvent };
