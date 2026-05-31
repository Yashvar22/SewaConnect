const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  verifyEmailOtp,
  resendVerificationOtp,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/verify-email
router.post("/verify-email", verifyEmailOtp);

// POST /api/auth/resend-verification-otp
router.post("/resend-verification-otp", resendVerificationOtp);

// POST /api/auth/request-password-reset
router.post("/request-password-reset", requestPasswordReset);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// GET /api/auth/me  — returns current user profile
router.get("/me", protect, getMe);

module.exports = router;
