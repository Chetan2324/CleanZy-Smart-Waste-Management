const AdminActivityLog = require('../models/AdminActivityLog');

// @desc    Get all audit logs (Paginated)
// @route   GET /api/admin/logs
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const logs = await AdminActivityLog.find()
      .populate('admin', 'name email') // Show Admin Name
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await AdminActivityLog.countDocuments();

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error("Audit Log Fetch Error:", error);
    res.status(500).json({ message: 'Server Error fetching logs' });
  }
};

module.exports = { getAuditLogs };