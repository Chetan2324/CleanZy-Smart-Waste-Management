const express = require('express');
const router = express.Router();

// CORRECT IMPORT: Middleware exports a function directly, NOT an object
const protect = require('../middleware/authMiddleware');

// Import Controller Functions
const { 
  createSchedule, 
  getUserSchedules, 
  getScheduleById 
} = require('../controllers/scheduleController');

// --- SAFETY CHECK (Prevents "handler must be a function" crash) ---
if (!protect) {
  console.error("FATAL ERROR: 'protect' middleware is undefined in routes/schedule.js");
  process.exit(1);
}
if (!createSchedule || !getUserSchedules || !getScheduleById) {
  console.error("FATAL ERROR: One or more scheduleController functions are undefined.");
  process.exit(1);
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