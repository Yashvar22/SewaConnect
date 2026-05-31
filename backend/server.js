const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const helmet     = require("helmet");
const compression = require("compression");
const rateLimit  = require("express-rate-limit");
const path       = require("path");
require("dotenv").config();

const app = express();

// ── Trust proxy (required when behind Render / Railway / Heroku) ─
app.set("trust proxy", 1);

// ── Security Headers ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow CDN images
    contentSecurityPolicy: false, // SPA handles its own CSP
  })
);

// ── Gzip Compression ─────────────────────────────────────────────
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────
// Build allowed origins list from env variables
// In production on Railway, CLIENT_URL = your public Railway app URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  // Railway also exposes RAILWAY_PUBLIC_DOMAIN — use it as a fallback
  process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : null,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173", // vite preview
]
  .filter(Boolean)
  // Strip trailing slashes so comparisons don't fail
  .map((o) => o.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalised = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalised)) return callback(null, true);
      console.error(`❌ Error: CORS: origin "${origin}" is not allowed`);
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials: true,
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────
// Strict limiter on auth endpoints to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Body Parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static Files (uploaded images – local fallback for local dev) ─
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────────────────
const testRoute       = require("./routes/testRoute");
const authRoutes      = require("./routes/authRoutes");
const ngoRoutes       = require("./routes/ngoRoutes");
const eventRoutes     = require("./routes/eventRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes  = require("./routes/donationRoutes");
const paymentRoutes   = require("./routes/paymentRoutes");
const adminRoutes     = require("./routes/adminRoutes");

app.use("/api",            apiLimiter,  testRoute);
app.use("/api/auth",       authLimiter, authRoutes);
app.use("/api/ngo",        apiLimiter,  ngoRoutes);
app.use("/api/event",      apiLimiter,  eventRoutes);
app.use("/api/volunteer",  apiLimiter,  volunteerRoutes);
app.use("/api/donation",   apiLimiter,  donationRoutes);
app.use("/api/payment",    apiLimiter,  paymentRoutes);
app.use("/api/admin",      apiLimiter,  adminRoutes);

// ── Serve React frontend in production ───────────────────────────
if (process.env.NODE_ENV === "production") {
  const frontendBuild = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendBuild));

  // SPA fallback: all non-API routes → index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuild, "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("SewaConnect Backend Running 🚀"));
}

// ── Centralized Error Handler ─────────────────────────────────────
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

// ── MongoDB Connection ────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1); // crash fast in production
  });

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀 [${process.env.NODE_ENV || "development"}]`)
);
