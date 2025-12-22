const Report = require('../models/Report');

// @desc    Create a new report (User only)
// @route   POST /api/reports
// @access  Private (User)
const createReport = async (req, res) => {
  try {
    const { type, description, location, image, aiAnalysis } = req.body;

    if (!type || !description) {
      return res.status(400).json({ message: 'Please provide type and description.' });
    }

    const report = new Report({
      user: req.user.id,
      type,
      description,
      location,
      image,
      aiAnalysis, // Optional AI data
      status: 'Pending'
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: savedReport
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ message: 'Server Error submitting report' });
  }
};

// @desc    Get logged-in user's reports history
// @route   GET /api/reports/my-reports
// @access  Private (User)
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Get User Reports Error:", error);
    res.status(500).json({ message: 'Server Error fetching history' });
  }
};

// @desc    Get single report details
// @route   GET /api/reports/:id
// @access  Private (Owner/Admin)
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Security check: only allow owner or admin to view
    // Note: Assuming req.user.role exists. If not using role, remove the `|| ... === 'admin'` part.
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createReport,
  getUserReports,
  getReportById
};