const express = require('express');
const router = express.Router();

// CORRECT IMPORT: Middleware exports a function directly
const protect = require('../middleware/authMiddleware');

// Import Controller Functions
const { 
  createSchedule, 
  getUserSchedules, 
  getScheduleById 
} = require('../controllers/scheduleController');

// --- DEBUGGING BLOCK ---
// This prevents the server from crashing with a vague error if an import fails
if (!protect) {
  throw new Error("FATAL ERROR: 'protect' middleware is undefined in routes/schedule.js");
}
if (!createSchedule || !getUserSchedules || !getScheduleById) {
  throw new Error("FATAL ERROR: One or more scheduleController functions are undefined.");
}

// --- SCHEDULE ROUTES ---

// @route   POST /api/schedule
// @desc    Schedule a new pickup
// @access  Private
router.post('/', protect, createSchedule);

// @route   GET /api/schedule/my-pickups
// @desc    Get history of pickups for logged-in user
// @access  Private
router.get('/my-pickups', protect, getUserSchedules);

// @route   GET /api/schedule/:id
// @desc    Get details of a specific pickup
// @access  Private
router.get('/:id', protect, getScheduleById);

module.exports = router;