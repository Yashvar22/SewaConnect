const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
} = require("../utils/emailService");

// Helper: generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register a new user and send verification OTP
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const allowedRoles = ["admin", "ngo", "user"];
    const userRole = role && allowedRoles.includes(role) ? role : "user";

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      emailVerified: false,
      emailVerificationOtp: otp,
      emailVerificationOtpExpires: otpExpires,
    });

    await sendEmailVerificationOtp({ to: user.email, name: user.name, otp });

    res.status(201).json({
      message:
        "A verification code has been sent to your email. Please enter it to complete registration.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify user email with OTP
// @route   POST /api/auth/verify-email
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }
    if (user.emailVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified. Please sign in." });
    }
    if (!user.emailVerificationOtp || user.emailVerificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (user.emailVerificationOtpExpires < new Date()) {
      return res
        .status(400)
        .json({
          message:
            "The verification code has expired. Please request a new one.",
        });
    }

    user.emailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: "Email verified successfully! You are now signed in.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Resend verification OTP to email
// @route   POST /api/auth/resend-verification-otp
const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }
    if (user.emailVerified) {
      return res
        .status(400)
        .json({ message: "This email is already verified. Please sign in." });
    }

    const otp = generateOtp();
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendEmailVerificationOtp({ to: user.email, name: user.name, otp });

    res
      .status(200)
      .json({
        message: "A new verification code has been sent to your email.",
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/request-password-reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    const otp = generateOtp();
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendPasswordResetOtp({ to: user.email, name: user.name, otp });

    res
      .status(200)
      .json({ message: "A password reset code has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }
    if (!user.passwordResetOtp || user.passwordResetOtp !== otp) {
      return res.status(400).json({ message: "Invalid reset code" });
    }
    if (user.passwordResetOtpExpires < new Date()) {
      return res
        .status(400)
        .json({
          message: "The reset code has expired. Please request a new one.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({
        message:
          "Your password has been reset successfully. Please sign in with your new password.",
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }
    if (!user.emailVerified && user.emailVerificationOtp) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password. Please try again." });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendVerificationOtp,
  requestPasswordReset,
  resetPassword,
  getMe,
};
