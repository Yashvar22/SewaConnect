const NGO = require("../models/NGO");
const User = require("../models/User");
const Event = require("../models/Event");
const Volunteer = require("../models/Volunteer");
const Donation = require("../models/Donation");
const { sendNGOVerifiedEmail, sendNGORejectedEmail } = require("../utils/emailService");

// POST /api/ngo/register
const registerNGO = async (req, res) => {
  try {
    const { name, description, location, category, contact, website, upiId, bankName, accountHolder, accountNumber, ifscCode } = req.body;
    const userId = req.user._id;
    if (!name) return res.status(400).json({ message: "NGO name is required" });
    // Check if this user already has an NGO
    const existing = await NGO.findOne({ createdBy: userId });
    if (existing) return res.status(409).json({ message: "You have already registered an NGO" });
    const photo = req.file ? req.file.path : undefined; // Cloudinary secure URL if uploaded
    const ngo = await NGO.create({ name, description, location, category: category || "other", contact, website, photo, upiId, bankName, accountHolder, accountNumber, ifscCode, createdBy: userId });
    res.status(201).json({ message: "NGO registered! Awaiting admin verification.", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/ngo/all  — public verified only
const getAllNGOs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { verified: true };
    if (category && category !== "all") filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
    const ngos = await NGO.find(filter).populate("createdBy", "name email");
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
    const ngo = await NGO.findById(req.params.id).populate("createdBy", "name email");
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    ngo.verified = true;
    ngo.rejected = false;
    await ngo.save();
    // Send email notification (fire-and-forget)
    if (ngo.createdBy?.email) {
      sendNGOVerifiedEmail({
        to: ngo.createdBy.email,
        ngoName: ngo.name,
        ownerName: ngo.createdBy.name || "there",
      });
    }
    res.status(200).json({ message: "NGO verified ✅", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/ngo/reject/:id  — admin rejects
const rejectNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate("createdBy", "name email");
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    ngo.verified = false;
    ngo.rejected = true;
    await ngo.save();
    // Send email notification (fire-and-forget)
    if (ngo.createdBy?.email) {
      sendNGORejectedEmail({
        to: ngo.createdBy.email,
        ngoName: ngo.name,
        ownerName: ngo.createdBy.name || "there",
        reason: req.body.reason || null,
      });
    }
    res.status(200).json({ message: "NGO rejected", ngo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/ngo/profile/:id  — NGO updates their own profile
const updateNGOProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, category, contact, website, upiId, bankName, accountHolder, accountNumber, ifscCode } = req.body;

    const ngo = await NGO.findById(id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Ensure only the creator can update
    if (ngo.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this NGO" });
    }

    if (name) ngo.name = name;
    if (description !== undefined) ngo.description = description;
    if (location !== undefined) ngo.location = location;
    if (category) ngo.category = category;
    if (contact !== undefined) ngo.contact = contact;
    if (website !== undefined) ngo.website = website;
    // Bank / UPI details
    if (upiId         !== undefined) ngo.upiId         = upiId;
    if (bankName      !== undefined) ngo.bankName      = bankName;
    if (accountHolder !== undefined) ngo.accountHolder = accountHolder;
    if (accountNumber !== undefined) ngo.accountNumber = accountNumber;
    if (ifscCode      !== undefined) ngo.ifscCode      = ifscCode;
    if (req.file) ngo.photo = req.file.path; // Cloudinary secure URL

    // Reset status to pending review upon profile update
    ngo.verified = false;
    ngo.rejected = false;

    await ngo.save();
    res.status(200).json({ message: "NGO profile updated ✅ Awaiting admin verification.", ngo });
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
