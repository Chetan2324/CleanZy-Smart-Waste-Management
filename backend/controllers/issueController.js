const Issue = require('../models/Issue');
const User = require('../models/User');
const logAdminAction = require('../utils/auditLogger'); // ✅ NEW IMPORT

// @desc    Report a new issue
// @route   POST /api/issues
// @access  Private (Resident)
const createIssue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide title, description, and category' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    const issue = await Issue.create({
      user: req.user._id,
      title,
      description,
      category,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue
    });

  } catch (error) {
    console.error("Create Issue Error:", error);
    res.status(500).json({ message: 'Server Error reporting issue' });
  }
};

// @desc    Get logged-in user's issues
// @route   GET /api/issues/my
// @access  Private (Resident)
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching your issues' });
  }
};

// @desc    Get all issues (Admin)
// @route   GET /api/issues/all
// @access  Private (Admin)
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching all issues' });
  }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private (Admin)
const updateIssueStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // 1. Capture OLD value for audit log
    const oldStatus = issue.status;

    // 2. Update fields
    if (status) issue.status = status;
    if (adminRemark) issue.adminRemark = adminRemark;

    await issue.save();

    // 3. 🔍 CREATE AUDIT LOG (Only if status changed)
    if (status && status !== oldStatus) {
      await logAdminAction({
        adminId: req.user._id,
        action: 'UPDATE_STATUS',
        target: 'ISSUE',
        targetId: issue._id,
        oldVal: { status: oldStatus },
        newVal: { status: status },
        req: req
      });
    }

    const updatedIssue = await Issue.findById(req.params.id).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: `Issue marked as ${status}`,
      issue: updatedIssue
    });

  } catch (error) {
    console.error("Update Issue Error:", error);
    res.status(500).json({ message: 'Server Error updating issue' });
  }
};

module.exports = { createIssue, getMyIssues, getAllIssues, updateIssueStatus };