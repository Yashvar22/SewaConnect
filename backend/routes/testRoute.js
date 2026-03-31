const express = require("express");
const router = express.Router();

// GET /api/test
router.get("/test", (req, res) => {
  res.json({ message: "API working ✅", status: "success", timestamp: new Date() });
});

module.exports = router;
