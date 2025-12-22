const SystemSettings = require('../models/SystemSettings');
const logAdminAction = require('../utils/auditLogger'); // ✅ IMPORT LOGGER

// @desc    Get System Settings
// @route   GET /api/admin/settings
const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getConfig(); // Using the helper method we defined in model
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching settings' });
  }
};

// @desc    Update/Toggle System Settings
// @route   PUT /api/admin/settings
const updateSettings = async (req, res) => {
  try {
    const { 
      maintenanceMode, 
      allowIssueReporting, 
      allowPickupScheduling, 
      maintenanceMessage 
    } = req.body;

    const settings = await SystemSettings.getConfig();

    // Capture OLD state for logs
    const oldState = {
      maintenanceMode: settings.maintenanceMode,
      allowIssueReporting: settings.allowIssueReporting,
      allowPickupScheduling: settings.allowPickupScheduling
    };

    // Apply updates
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowIssueReporting !== undefined) settings.allowIssueReporting = allowIssueReporting;
    if (allowPickupScheduling !== undefined) settings.allowPickupScheduling = allowPickupScheduling;
    if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;

    settings.updatedBy = req.user._id;
    await settings.save();

    // 🔍 AUDIT LOGGING
    // Check what changed and log it
    let changes = {};
    if (maintenanceMode !== undefined && maintenanceMode !== oldState.maintenanceMode) {
       changes.maintenanceMode = maintenanceMode;
    }
    if (allowIssueReporting !== undefined && allowIssueReporting !== oldState.allowIssueReporting) {
       changes.allowIssueReporting = allowIssueReporting;
    }
    // ... (you can add more detailed checks if needed)

    // Log the event
    await logAdminAction({
      adminId: req.user._id,
      action: 'TOGGLE_FEATURE',
      target: 'SYSTEM_SETTINGS',
      oldVal: oldState,
      newVal: changes, // Only logging what changed effectively
      req: req
    });

    res.json({ success: true, settings });

  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(500).json({ message: 'Server Error updating settings' });
  }
};

module.exports = { getSettings, updateSettings };