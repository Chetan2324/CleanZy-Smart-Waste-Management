const Settings = require('../models/Settings');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // 1. Fetch Global Settings
    const settings = await Settings.findOne();

    // If no settings exist or maintenance is OFF, proceed immediately
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // 2. ✅ ADMIN BYPASS (Critical)
    // The 'protect' middleware runs before this, so req.user is available.
    if (req.user && req.user.role === 'admin') {
      console.log(`🛡️ Maintenance Bypass: Admin access granted to ${req.user.email}`);
      return next();
    }

    // 3. ⛔ BLOCK CITIZENS
    console.log(`⛔ Maintenance Block: Request denied for ${req.user ? req.user.email : 'Unknown'}`);
    return res.status(503).json({
      message: 'System under maintenance. Please try again later.'
    });

  } catch (error) {
    console.error("Maintenance Middleware Error:", error);
    // Fail safe: If DB fails, allow request but log error (or block depending on strictness preference)
    // Here we return 500 to be safe.
    res.status(500).json({ message: 'Server Error checking maintenance status' });
  }
};

module.exports = maintenanceMiddleware;