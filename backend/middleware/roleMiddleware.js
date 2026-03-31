// @desc    Restrict route to specific roles
// Usage:   router.put("/verify/:id", protect, authorizeRoles("admin"), verifyNGO)

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role: [${roles.join(", ")}]. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };
