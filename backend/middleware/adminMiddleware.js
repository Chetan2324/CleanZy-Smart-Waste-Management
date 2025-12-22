// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
  // Ensure req.user exists (set by authMiddleware)
  if (req.user && req.user.role) {
    // Case-insensitive check (admin, Admin, ADMIN)
    if (req.user.role.toLowerCase() === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admins only' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { adminCheck };