const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import your updated middleware
const { 
  getMe, 
  updateSettings, 
  changePassword, 
  logoutAllDevices 
} = require('../controllers/userController');

// @route   GET /api/user/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/user/settings
// @desc    Update user preferences
// @access  Private
router.put('/settings', auth, updateSettings);

// @route   PUT /api/user/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, changePassword);

// @route   POST /api/user/logout-all
// @desc    Invalidate all sessions
// @access  Private
router.post('/logout-all', auth, logoutAllDevices);

module.exports = router;