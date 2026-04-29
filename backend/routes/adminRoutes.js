const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, getStats, getUserActivity, getChartData } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All admin routes require login + admin role
router.use(protect, authorizeRoles("admin"));

// GET  /api/admin/stats              → platform-wide statistics
router.get("/stats", getStats);

// GET  /api/admin/users              → list all users
router.get("/users", getAllUsers);

// GET  /api/admin/users/:id/activity → a user's donations + applications
router.get("/users/:id/activity", getUserActivity);

// DELETE /api/admin/users/:id        → delete a user
router.delete("/users/:id", deleteUser);

// GET /api/admin/chart-data           → aggregated chart data
router.get("/chart-data", getChartData);

module.exports = router;
