const express = require('express');
const router = express.Router();

// --- MIDDLEWARE ---
const protect = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');

// --- CONTROLLER IMPORTS ---
// We import specifically from the adminController where we added the logic in Step 2
const {
  getAllPickups,
  getPickupById,
  updatePickupStatus
} = require('../controllers/adminController');

// --- SAFETY CHECK ---
if (!getAllPickups || !getPickupById || !updatePickupStatus) {
  console.error("FATAL ERROR: Pickup Controller functions are undefined. Check adminController.js exports.");
}

// ==========================================
// 🔐 GLOBAL SECURITY
// ==========================================
// Apply middleware to ALL routes in this file
router.use(protect);
router.use(adminCheck);

// ==========================================
// 🛣️ PICKUP ROUTES
// ==========================================

// @route   GET /api/admin/pickups
// @desc    Fetch all pickups (with sorting & filtering)
router.get('/', getAllPickups);

// @route   GET /api/admin/pickups/:id
// @desc    Get single pickup details
router.get('/:id', getPickupById);

// @route   PATCH /api/admin/pickups/:id/status
// @desc    Update status (Approve, Complete, Cancel)
// @access  Admin Only
router.patch('/:id/status', updatePickupStatus);

module.exports = router;