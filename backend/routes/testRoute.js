const express = require("express");
const router = express.Router();
const { sendNGOVerifiedEmail } = require("../utils/emailService");

// GET /api/test
router.get("/test", (req, res) => {
  res.json({ message: "API working ✅", status: "success", timestamp: new Date() });
});

// GET /api/test-email
router.get("/test-email", async (req, res, next) => {
  try {
    const toEmail = req.query.email || "officialvardhan3@gmail.com";
    await sendNGOVerifiedEmail({
      to: toEmail,
      ngoName: "Test NGO Connect",
      ownerName: "Vardhan",
    });
    res.json({ message: `Test email sent successfully to ${toEmail}!` });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = router;
