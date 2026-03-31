const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @desc    Verify JWT token, attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Expect token in: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found. Token invalid." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token verification failed.", error: error.message });
  }
};

module.exports = { protect };
