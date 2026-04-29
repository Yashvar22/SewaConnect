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

// @desc    Get chart data for Admin dashboard
// @route   GET /api/admin/chart-data
const getChartData = async (req, res) => {
  try {
    // 1. NGO category distribution
    const categoryAgg = await NGO.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const categoryData = {
      labels: categoryAgg.map(c => c._id || "other"),
      counts: categoryAgg.map(c => c.count),
    };

    // 2. Monthly donations — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const donationAgg = await Donation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: 1 },
          moneyTotal: { $sum: { $cond: [{ $eq: ["$type", "money"] }, "$amount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build 6-month label array (oldest → newest)
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthLabels = [], donationCounts = [], moneySums = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yr = d.getFullYear(), mo = d.getMonth() + 1;
      monthLabels.push(`${monthNames[d.getMonth()]} '${String(yr).slice(2)}`);
      const found = donationAgg.find(a => a._id.year === yr && a._id.month === mo);
      donationCounts.push(found ? found.total : 0);
      moneySums.push(found ? Math.round(found.moneyTotal) : 0);
    }

    // 3. Verified vs Pending vs Rejected NGOs
    const [verifiedCount, pendingCount, rejectedCount] = await Promise.all([
      NGO.countDocuments({ verified: true }),
      NGO.countDocuments({ verified: false, rejected: false }),
      NGO.countDocuments({ rejected: true }),
    ]);

    res.status(200).json({
      categoryData,
      donationTrend: { labels: monthLabels, counts: donationCounts, amounts: moneySums },
      ngoStatus: { verified: verifiedCount, pending: pendingCount, rejected: rejectedCount },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getStats, getUserActivity, getChartData };

