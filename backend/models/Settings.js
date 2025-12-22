const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    allowIssueReporting: {
      type: Boolean,
      default: true,
      description: 'Master switch to enable/disable issue reporting'
    },
    allowPickupScheduling: {
      type: Boolean,
      default: true,
      description: 'Master switch to enable/disable pickup scheduling'
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
      description: 'If true, only admins can access critical features'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'The admin who last updated these settings'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', SettingsSchema);