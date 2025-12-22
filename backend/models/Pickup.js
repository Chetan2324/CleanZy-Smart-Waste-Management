const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema(
  {
    // --- RELATIONS ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // --- SNAPSHOTS (For History) ---
    userName: { type: String, required: true },
    email: { type: String, required: true },

    // --- DATA ---
    wasteType: {
      type: String,
      enum: ['Dry', 'Wet', 'Electronic', 'Medical', 'Mixed', 'E-Waste', 'Bulk/Furniture'], 
      required: true
    },
    address: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    instructions: { type: String, default: '' },

    // --- STATE MACHINE ---
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
      lowercase: true,
      index: true
    },

    // --- TRACKING ---
    timeline: [
      {
        status: { type: String },
        changedBy: { type: String }, // 'Admin' or User Name
        date: { type: Date, default: Date.now },
        remark: { type: String }
      }
    ],

    // --- DETAILS ---
    driverDetails: {
      name: String,
      contact: String,
      vehicleNumber: String
    },
    wasteCollected: { type: Number, default: 0 },
    adminRemark: { type: String, default: '' }
  },
  { timestamps: true }
);

// --- INDUSTRY LEVEL: PRE-SAVE VALIDATION HOOK ---
// This prevents bad data even if the controller logic fails.
PickupSchema.pre('save', async function(next) {
  if (this.isNew) return next();

  if (this.isModified('status')) {
    // 1. Fetch the previous document state
    const original = await this.constructor.findById(this._id);
    const oldStatus = original.status;
    const newStatus = this.status;

    // 2. Define Valid Transitions
    const allowedTransitions = {
      'pending': ['approved', 'cancelled'],
      'approved': ['completed', 'cancelled'],
      'completed': [], // Terminal state
      'cancelled': []  // Terminal state
    };

    // 3. Check Validity
    if (!allowedTransitions[oldStatus].includes(newStatus)) {
      const err = new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Pickup', PickupSchema);