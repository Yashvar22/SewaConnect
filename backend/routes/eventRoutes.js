const express = require("express");
const router = express.Router();
const { createEvent, getAllEvents, getEventById, getEventsByNGO, cancelEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/create",    protect, authorizeRoles("ngo", "admin"),   createEvent);
router.get("/all",                                                    getAllEvents);
router.get("/ngo/:id",                                                getEventsByNGO);
router.get("/:id",                                                    getEventById);
router.delete("/:id",     protect, authorizeRoles("ngo", "admin"),   cancelEvent);

module.exports = router;
