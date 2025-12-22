const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
  try {
    // Try to find existing settings
    let settings = await Settings.findOne();

    // If no settings exist yet, create default entry (Auto-Initialization)
    if (!settings) {
      settings = await Settings.create({
        allowIssueReporting: true,
        allowPickupScheduling: true,
        maintenanceMode: false
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ message: 'Server Error fetching settings' });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const { allowIssueReporting, allowPickupScheduling, maintenanceMode } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create if doesn't exist (safety fallback)
      settings = new Settings();
    }

    // Update fields
    if (typeof allowIssueReporting !== 'undefined') settings.allowIssueReporting = allowIssueReporting;
    if (typeof allowPickupScheduling !== 'undefined') settings.allowPickupScheduling = allowPickupScheduling;
    if (typeof maintenanceMode !== 'undefined') settings.maintenanceMode = maintenanceMode;
    
    // Track who updated it
    settings.updatedBy = req.user._id;

    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: 'Server Error updating settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};