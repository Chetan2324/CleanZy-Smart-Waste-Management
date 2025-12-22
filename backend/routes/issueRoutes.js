const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');
const checkFeature = require('../middleware/featureFlagMiddleware'); // ✅ NEW IMPORT

const { 
  createIssue, 
  getMyIssues, 
  getAllIssues, 
  updateIssueStatus 
} = require('../controllers/issueController');

// ==============================
// CITIZEN ROUTES
// ==============================

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private (Resident) - ENFORCED by Feature Flag
router.post(
  '/', 
  protect, 
  checkFeature('issueReportingEnabled', 'Issue Reporting'), // ✅ Feature Check
  createIssue
);

// @route   GET /api/issues/my
// @desc    Get my issues
// @access  Private (Resident) - ALWAYS ALLOWED (Read-only)
router.get('/my', protect, getMyIssues);

// ==============================
// ADMIN ROUTES
// ==============================

// @route   GET /api/issues/all
// @desc    Get all issues
// @access  Private (Admin)
router.get('/all', protect, adminCheck, getAllIssues);

// @route   PATCH /api/issues/:id/status
// @desc    Update issue status
// @access  Private (Admin)
router.patch('/:id/status', protect, adminCheck, updateIssueStatus);

module.exports = router;