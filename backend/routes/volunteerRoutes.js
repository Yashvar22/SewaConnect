const express = require("express");
const router = express.Router();
const {
  applyForEvent,
  getUserApplications,
  approveVolunteer,
  rejectVolunteer,
  withdrawApplication,
  getMyApplications,
  getVolunteersForEvent,
} = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// POST /api/volunteer/apply        → any logged-in user (userId from JWT)
router.post("/apply", protect, applyForEvent);

// GET /api/volunteer/my            → auth'd user's own applications (JWT-based)
router.get("/my", protect, getMyApplications);

// GET /api/volunteer/my/:userId    → legacy route kept for backward compat
router.get("/my/:userId", protect, getUserApplications);

// GET /api/volunteer/event/:eventId → volunteers for an event (ngo/admin)
router.get("/event/:eventId", protect, authorizeRoles("ngo", "admin"), getVolunteersForEvent);

// PUT /api/volunteer/approve/:id   → ngo or admin
router.put("/approve/:id", protect, authorizeRoles("ngo", "admin"), approveVolunteer);

// PUT /api/volunteer/reject/:id    → ngo or admin
router.put("/reject/:id", protect, authorizeRoles("ngo", "admin"), rejectVolunteer);

// DELETE /api/volunteer/:id        → user withdraws their own application
router.delete("/:id", protect, withdrawApplication);

module.exports = router;
