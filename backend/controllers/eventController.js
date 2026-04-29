const Event = require("../models/Event");
const NGO = require("../models/NGO");

// POST /api/event/create
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxVolunteers, ngoId } = req.body;
    if (!title || !ngoId) return res.status(400).json({ message: "Title and ngoId are required" });
    const ngo = await NGO.findById(ngoId);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    if (!ngo.verified) return res.status(403).json({ message: "NGO is not verified. Admin must verify before creating events." });
    const event = await Event.create({ title, description, date, location, maxVolunteers: maxVolunteers || 0, ngoId });
    res.status(201).json({ message: "Event created ✅", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/event/all
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("ngoId", "name description verified photo")
      .sort({ date: 1 });
    res.status(200).json({ message: "Events fetched", count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/event/:id  — single event detail
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("ngoId", "name description verified photo location");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/event/ngo/:id
const getEventsByNGO = async (req, res) => {
  try {
    const { id } = req.params;
    const ngo = await NGO.findById(id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });
    const events = await Event.find({ ngoId: id }).sort({ date: 1 });
    res.status(200).json({ message: `Events for ${ngo.name}`, count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/event/:id  — cancel event (admin/ngo)
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event cancelled/deleted ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, getEventsByNGO, cancelEvent };
