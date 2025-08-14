exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // التأكد من وجود المستخدم
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // التحقق من الدور
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        yourRole: req.user.role
      });
    }

    next();
  };
};
