const express = require('express');
const router = express.Router();

// Middleware
const protect = require('../middleware/authMiddleware');
const checkFeature = require('../middleware/featureFlagMiddleware'); // ✅ NEW IMPORT

// Controller
const { createPickup, getMyPickups } = require('../controllers/pickupController');

// Routes
// Base URL: /api/pickups (Defined in server.js)

// @route   POST /api/pickups
// @desc    Create a new pickup request
// @access  Private (Resident) - ENFORCED by Feature Flag
router.post(
  '/', 
  protect, 
  checkFeature('pickupSchedulingEnabled', 'Pickup Scheduling'), // ✅ Feature Check
  createPickup
);

// @route   GET /api/pickups/my-pickups
// @desc    Get logged-in user's pickup history
// @access  Private (Resident) - ALWAYS ALLOWED (Read-only)
router.get('/my-pickups', protect, getMyPickups);

module.exports = router;