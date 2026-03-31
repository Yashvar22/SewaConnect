const NGO = require("../models/NGO");
const User = require("../models/User");
const Event = require("../models/Event");
const Volunteer = require("../models/Volunteer");
const Donation = require("../models/Donation");

// POST /api/ngo/register
const registerNGO = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const userId = req.user._id;
    if (!name) return res.status(400).json({ message: "NGO name is required" });
    const ngo = await NGO.create({ name, description, location, createdBy: userId });
    res.status(201).json({ message: "NGO registered! Awaiting admin verification.", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/all  — public verified only
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ verified: true }).populate("createdBy", "name email");
    res.status(200).json({ message: "Verified NGOs", count: ngos.length, ngos });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/admin/all  — admin all
const getAllNGOsAdmin = async (req, res) => {
  try {
    console.log("[Admin] Fetching all NGOs...");
    const ngos = await NGO.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.status(200).json({ message: "All NGOs", count: ngos.length, ngos });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/:id  — single NGO detail
const getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate("createdBy", "name email");
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    res.status(200).json({ ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/ngo/verify/:id  — admin verifies
const verifyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    if (ngo.verified) return res.status(400).json({ message: "Already verified" });
    ngo.verified = true;
    ngo.rejected = false;
    await ngo.save();
    res.status(200).json({ message: "NGO verified ✅", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/ngo/reject/:id  — admin rejects
const rejectNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    ngo.verified = false;
    ngo.rejected = true;
    await ngo.save();
    res.status(200).json({ message: "NGO rejected", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/ngo/profile/:id  — NGO updates their own profile
const updateNGOProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location } = req.body;

    const ngo = await NGO.findById(id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Ensure only the creator can update
    if (ngo.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this NGO" });
    }

    if (name) ngo.name = name;
    if (description) ngo.description = description;
    if (location) ngo.location = location;
    if (req.file) ngo.photo = `/uploads/${req.file.filename}`;

    await ngo.save();
    res.status(200).json({ message: "NGO profile updated ✅", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/my  — NGO owner sees their own NGO
const getMyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ createdBy: req.user._id }).populate("createdBy", "name email");
    if (!ngo) return res.status(404).json({ message: "No NGO registered for your account" });
    res.status(200).json({ ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/:id/stats  — events + volunteer count for an NGO
const getNGOStats = async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.params.id });
    const eventIds = events.map(e => e._id);
    const [volunteerCount, donationCount] = await Promise.all([
      Volunteer.countDocuments({ eventId: { $in: eventIds } }),
      Donation.countDocuments({ ngoId: req.params.id }),
    ]);
    res.status(200).json({ eventCount: events.length, volunteerCount, donationCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerNGO, getAllNGOs, getAllNGOsAdmin, getNGOById, verifyNGO, rejectNGO, updateNGOProfile, getMyNGO, getNGOStats };
