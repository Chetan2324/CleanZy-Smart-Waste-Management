const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Essential report details
    type: {
      type: String, // e.g., "Missed Pickup", "Overflow"
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    image: {
      type: String, // URL to uploaded image
      default: '',
    },
    
    // --- AI & ANALYSIS FIELDS ---
    aiAnalysis: {
      type: Object, // Stores JSON data from AI analysis if needed
      default: null
    },

    // --- STATUS & WORKFLOW ---
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    
    // --- ADMIN RESOLUTION DATA ---
    adminRemark: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', ReportSchema);