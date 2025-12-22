const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema(
  {
    // --- 1. GLOBAL MAINTENANCE CONTROLS ---
    maintenanceMode: {
      type: Boolean,
      default: false,
      description: 'Master switch. If true, blocks all citizen access.'
    },
    
    // Detailed window for planned downtime (optional, strictly for UI communication)
    maintenanceWindow: {
      start: {
        type: Date,
        default: null
      },
      end: {
        type: Date,
        default: null
      }
    },

    // Custom message displayed to users during downtime
    maintenanceMessage: {
      type: String,
      default: "We are currently performing system upgrades. Please check back later.",
      trim: true
    },

    // --- 2. FEATURE TOGGLES (Granular Access) ---
    // If false, the specific feature is disabled, but the rest of the app works
    allowIssueReporting: {
      type: Boolean,
      default: true 
    },
    allowPickupScheduling: {
      type: Boolean,
      default: true
    },

    // --- 3. AUDIT TRAIL ---
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'system_settings' // Force specific collection name
  }
);

// --- SINGLETON HELPER (Optional but Recommended) ---
// This static method ensures you always get the ONE existing config document.
// If it doesn't exist, it creates it with defaults.
SystemSettingsSchema.statics.getConfig = async function () {
  const config = await this.findOne();
  if (config) return config;
  return await this.create({});
};

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);