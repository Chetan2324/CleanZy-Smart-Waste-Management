const express = require('express');
const router = express.Router();

// Middleware
const protect = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');

// Controller
const { getSettings, updateSettings } = require('../controllers/settingsController');

// @route   GET /api/admin/settings
// @desc    Fetch system configuration (Allowed for all logged-in users)
// @access  Private (Resident & Admin)
router.get('/', protect, getSettings); 

// @route   PUT /api/admin/settings
// @desc    Update system configuration
// @access  Private (Admin Only)
router.put('/', protect, adminCheck, updateSettings);

module.exports = router;