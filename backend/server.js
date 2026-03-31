const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static Files (uploaded images) ───────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────────────
const testRoute       = require("./routes/testRoute");
const authRoutes      = require("./routes/authRoutes");
const ngoRoutes       = require("./routes/ngoRoutes");
const eventRoutes     = require("./routes/eventRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes  = require("./routes/donationRoutes");
const adminRoutes     = require("./routes/adminRoutes");

app.use("/api",            testRoute);
app.use("/api/auth",       authRoutes);
app.use("/api/ngo",        ngoRoutes);
app.use("/api/event",      eventRoutes);
app.use("/api/volunteer",  volunteerRoutes);
app.use("/api/donation",   donationRoutes);
app.use("/api/admin",      adminRoutes);

// ── Root ─────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("NGO Connect Backend Running 🚀"));

// ── MongoDB Connection ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
