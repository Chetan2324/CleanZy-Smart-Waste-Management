const express = require('express');
const router = express.Router();

// Middleware
const protect = require('../middleware/authMiddleware');

// Controller
const { createIssue, getMyIssues } = require('../controllers/issueController');

// Base Route: /api/issues (Defined in server.js)

// @route   POST /api/issues
// @desc    Report a new issue
// @access  Private
router.post('/', protect, createIssue);

// @route   GET /api/issues/my-issues
// @desc    View my reported issues
// @access  Private
router.get('/my-issues', protect, getMyIssues);

module.exports = router;