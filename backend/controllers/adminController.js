const User = require("../models/User");
const NGO = require("../models/NGO");
const Event = require("../models/Event");
const Donation = require("../models/Donation");
const Volunteer = require("../models/Volunteer");

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ message: "Users fetched", count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete an admin account" });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get platform-wide stats (Admin only)
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalNGOs, verifiedNGOs, pendingNGOs, totalEvents, totalDonations, totalVolunteers] =
      await Promise.all([
        User.countDocuments(),
        NGO.countDocuments(),
        NGO.countDocuments({ verified: true }),
        NGO.countDocuments({ verified: false, rejected: false }),
        Event.countDocuments(),
        Donation.countDocuments(),
        Volunteer.countDocuments(),
      ]);
    res.status(200).json({
      totalUsers,
      totalNGOs,
      verifiedNGOs,
      pendingNGOs,
      totalEvents,
      totalDonations,
      totalVolunteers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user activity profile (Admin view)
// @route   GET /api/admin/users/:id/activity
const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [donations, applications] = await Promise.all([
      Donation.find({ donorId: user._id }).populate("ngoId", "name").sort({ createdAt: -1 }),
      Volunteer.find({ userId: user._id })
        .populate({ path: "eventId", select: "title date", populate: { path: "ngoId", select: "name" } })
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({ user, donations, applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getStats, getUserActivity };
