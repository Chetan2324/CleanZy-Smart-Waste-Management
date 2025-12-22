const mongoose = require('mongoose');

const AdminActivityLogSchema = new mongoose.Schema(
  {
    // WHO performed the action
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true 
    },

    // WHAT action was taken
    actionType: {
      type: String,
      required: true,
      enum: ['UPDATE_STATUS', 'TOGGLE_FEATURE', 'SYSTEM_UPDATE', 'DELETE'],
      uppercase: true
    },

    // WHERE/WHAT entity was targeted
    targetType: {
      type: String,
      required: true,
      enum: ['ISSUE', 'PICKUP', 'SYSTEM_SETTINGS', 'USER'],
      uppercase: true
    },

    // ID of the target (Issue ID, Pickup ID, etc.)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    // SNAPSHOTS (For history/undo)
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    
    // METADATA (IP, Device)
    meta: {
      ip: String,
      device: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // We only need creation time
  }
);

// Indexes for performance
AdminActivityLogSchema.index({ admin: 1, createdAt: -1 });
AdminActivityLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminActivityLog', AdminActivityLogSchema);