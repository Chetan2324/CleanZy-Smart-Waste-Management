const SystemSettings = require('../models/SystemSettings');

const checkMaintenance = async (req, res, next) => {
  try {
    // 1. Fetch the singleton settings document
    // We lean on the fact that there is only one document or we take the first one found
    const settings = await SystemSettings.findOne();

    // If no settings exist yet, assume system is live and allow traffic
    if (!settings) {
      return next();
    }

    // 2. Check if Maintenance Mode is ACTIVE
    if (settings.maintenanceMode) {
      
      // 3. Admin Bypass Logic
      // Ensure req.user exists (Auth middleware must run BEFORE this)
      if (req.user && (req.user.role === 'admin' || req.user.role === 'administrator')) {
        // Admin detected: Allow request to proceed
        return next();
      }

      // 4. Block Citizen/Public Access
      // Return 503 (Service Unavailable)
      return res.status(503).json({
        success: false,
        message: settings.maintenanceMessage || "System is under maintenance. Please try again later.",
        maintenance: true,
        window: {
          start: settings.maintenanceStart,
          end: settings.maintenanceEnd
        }
      });
    }

    // If Maintenance is OFF, proceed normally
    next();

  } catch (error) {
    console.error("Maintenance Check Error:", error);
    // Fail-safe: In case of DB error, we generally don't want to crash the request flow,
    // but for security/stability, returning 500 is standard here.
    res.status(500).json({ message: "Server Error verifying system status" });
  }
};

module.exports = checkMaintenance;