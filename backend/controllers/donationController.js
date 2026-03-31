const Donation = require("../models/Donation");
const User = require("../models/User");

// POST /api/donation/create
const createDonation = async (req, res) => {
  try {
    const donorId = req.user._id;
    const { type = "item", itemName, description, amount, pickupAddress, pickupOption, ngoId } = req.body;

    if (type === "money") {
      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount is required for money donation" });
      }
      const donation = await Donation.create({ type: "money", amount: Number(amount), description, donorId, ngoId: ngoId || undefined });
      return res.status(201).json({ message: "Money donation created ✅", donation });
    }

    // Item donation
    if (!itemName) return res.status(400).json({ message: "Item name is required" });
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const donation = await Donation.create({
      type: "item", itemName, description, image, pickupAddress, pickupOption, donorId, ngoId: ngoId || undefined,
    });
    res.status(201).json({ message: "Item donation created ✅", donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/donation/all
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId", "name email")
      .populate("ngoId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Donations fetched", count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/donation/my — current user's donations
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate("ngoId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Your donations", count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createDonation, getAllDonations, getMyDonations };
