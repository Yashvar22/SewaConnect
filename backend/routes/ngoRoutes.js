const express = require("express");
const router = express.Router();
const {
  registerNGO, getAllNGOs, getAllNGOsAdmin, getNGOById,
  verifyNGO, rejectNGO, updateNGOProfile, getMyNGO, getNGOStats
} = require("../controllers/ngoController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register",           protect, upload.single("photo"),    registerNGO);
router.get("/all",                                                     getAllNGOs);
router.get("/admin/all",           protect, authorizeRoles("admin"),   getAllNGOsAdmin);

// IMPORTANT: specific named paths MUST come before the /:id wildcard
router.get("/my",                  protect,                            getMyNGO);
router.get("/:id/stats",                                               getNGOStats);   // <-- must be before /:id
router.get("/:id",                                                     getNGOById);

router.put("/verify/:id",          protect, authorizeRoles("admin"),   verifyNGO);
router.put("/reject/:id",          protect, authorizeRoles("admin"),   rejectNGO);
router.put("/profile/:id",         protect, upload.single("photo"),    updateNGOProfile);

module.exports = router;
