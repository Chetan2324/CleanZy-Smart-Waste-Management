const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true, // Forces lowercase in DB
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    // STRICT ROLES: Public users are ALWAYS 'resident'.
    // 'admin' and 'collector' are created manually in DB.
    role: {
      type: String,
      enum: ['resident', 'admin', 'collector', 'Resident', 'Admin', 'Collector'], 
      default: 'resident',
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    tokenVersion: {
      type: Number,
      default: 0 
    },
    // User Settings Profile
    settings: {
      notifications: { type: Boolean, default: true },
      preferredPickupTime: { type: String, default: "Morning" },
      defaultWasteType: { type: String, default: "Mixed" }
    },
    // Security Logs
    loginHistory: [{
      date: { type: Date, default: Date.now },
      ip: String,
      device: String
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);