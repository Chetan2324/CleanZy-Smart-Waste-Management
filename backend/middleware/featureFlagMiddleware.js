const SystemSettings = require('../models/SystemSettings');

/**
 * Middleware Factory to enforce feature toggles.
 * @param {string} settingKey - The boolean key in SystemSettings schema (e.g., 'issueReportingEnabled')
 * @param {string} featureName - Human readable name for the error response (e.g., 'issues')
 */
const checkFeature = (settingKey, featureName) => {
  return async (req, res, next) => {
    try {
      // 1. Fetch Global Settings
      // We rely on the singleton nature of the settings document
      const settings = await SystemSettings.findOne();

      // If no settings exist, default to open/allowed or handle as error
      if (!settings) {
        return next();
      }

      // 2. Check the specific feature flag
      const isFeatureEnabled = settings[settingKey];

      // If feature is enabled, proceed immediately
      if (isFeatureEnabled) {
        return next();
      }

      // 3. FEATURE IS DISABLED -> Check for Admin Bypass
      // req.user is populated by your auth middleware (protect)
      if (req.user && (req.user.role === 'admin' || req.user.role === 'administrator')) {
        // Admin allowed to bypass restrictions
        return next();
      }

      // 4. Block Access
      return res.status(403).json({
        success: false,
        message: `${featureName} is temporarily disabled by the administrator.`,
        featureDisabled: true,
        feature: featureName
      });

    } catch (error) {
      console.error(`Feature Flag Error (${settingKey}):`, error);
      res.status(500).json({ message: "Server error checking feature availability" });
    }
  };
};

module.exports = checkFeature;