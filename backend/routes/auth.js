const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); 

// Import Controller Functions
const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');

// Debug check
if (!loginUser || !registerUser) {
  console.error("FATAL ERROR: Auth Controller functions not loaded.");
}

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private Routes
router.get('/me', protect, getMe);

module.exports = router;