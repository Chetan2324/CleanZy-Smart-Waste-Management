const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteType: {
      type: String,
      enum: ['Dry', 'Wet', 'E-Waste', 'Mixed', 'Bulk'],
      required: true,
    },
    date: {
      type: String, // Storing as YYYY-MM-DD
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    instructions: {
      type: String,
      default: '',
    },
    
    // --- STATUS & WORKFLOW ---
    status: {
      type: String,
      enum: ['Scheduled', 'Assigned', 'On the Way', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    
    // --- DRIVER ASSIGNMENT ---
    // Using an embedded object for specific trip details
    driverDetails: {
      name: { type: String, default: '' },
      contact: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' }
    },

    // --- OUTCOME DATA ---
    wasteCollected: {
      type: Number, // In Kilograms
      default: 0,
    },
    completedAt: {
      type: Date,
    },

    // --- CANCELLATION ---
    cancelledReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);