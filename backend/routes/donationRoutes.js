const express = require("express");
const router = express.Router();
const { createDonation, getAllDonations, getMyDonations } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/create",   protect, upload.single("image"),   createDonation);
router.get("/all",                                          getAllDonations);
router.get("/my",        protect,                           getMyDonations);

module.exports = router;
