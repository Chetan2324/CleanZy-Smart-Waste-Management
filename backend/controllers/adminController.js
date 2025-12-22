const User = require('../models/User');
const Pickup = require('../models/Pickup');
const Report = require('../models/Report');

// ==========================================
// 1. SYSTEM & DASHBOARD
// ==========================================

// @desc    Check Admin System Status
// @route   GET /api/admin/health
const adminHealthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Admin System Operational",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, blockedUsers,
      totalPickups, pendingPickups, completedPickups, cancelledPickups,
      wasteStats,
      totalIssues, pendingIssues, resolvedIssues,
      recentPickups, recentReports
    ] = await Promise.all([
      // User Stats
      User.countDocuments({ role: 'resident' }),
      User.countDocuments({ role: 'resident', isBlocked: false }),
      User.countDocuments({ role: 'resident', isBlocked: true }),

      // Pickup Stats (Using Pickup Model)
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: 'pending' }),
      Pickup.countDocuments({ status: 'completed' }),
      Pickup.countDocuments({ status: 'cancelled' }),
      
      // Total Waste (Sum)
      Pickup.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalWeight: { $sum: '$wasteCollected' } } }
      ]),

      // Issue Stats
      Report.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ status: 'Resolved' }),

      // Recent Data (Limit 5)
      Pickup.find().sort({ createdAt: -1 }).limit(5).select('userName wasteType scheduledDate status'),
      Report.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').select('type status createdAt')
    ]);

    const totalWasteCollected = wasteStats.length > 0 ? wasteStats[0].totalWeight : 0;

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, blocked: blockedUsers },
        pickups: { total: totalPickups, pending: pendingPickups, completed: completedPickups, cancelled: cancelledPickups, totalWasteCollected },
        issues: { total: totalIssues, pending: pendingIssues, resolved: resolvedIssues },
        recentActivity: { pickups: recentPickups, reports: recentReports }
      }
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Server Error fetching dashboard' });
  }
};

// ==========================================
// 2. USER / RESIDENT MANAGEMENT
// ==========================================

const getResidents = async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json(residents);
  } catch (error) {
    console.error("Fetch Residents Error:", error);
    res.status(500).json({ message: 'Failed to fetch residents' });
  }
};

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot block an admin' });

    user.isBlocked = !user.isBlocked;
    if (user.isBlocked) user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();
    res.status(200).json({ success: true, message: user.isBlocked ? `User blocked` : `User unblocked`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'You cannot change your own role' });

    user.role = user.role === 'user' ? 'admin' : 'user';
    await user.save();
    res.status(200).json({ message: `User role updated to ${user.role}` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// ==========================================
// 3. PICKUP MANAGEMENT (CORE LOGIC)
// ==========================================

// @desc    Get All Pickups
// @route   GET /api/admin/pickups
const getAllPickups = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    if (search) {
      // Search by Snapshot Name, Email or Address
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Populate user to get live avatar/data if needed, but rely on snapshots for display
    const pickups = await Pickup.find(query)
      .populate('user', 'name email') 
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(pickups);
  } catch (error) {
    console.error("Fetch Pickups Error:", error);
    res.status(500).json({ message: 'Server Error fetching pickups' });
  }
};

// @desc    Get Single Pickup
// @route   GET /api/admin/pickups/:id
const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('user', 'name email mobile');
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.status(200).json(pickup);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Pickup Status (State Machine Logic)
// @route   PATCH /api/admin/pickups/:id/status
const updatePickupStatus = async (req, res) => {
  try {
    const { status, driverDetails, wasteCollected, adminRemark } = req.body;
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    const currentStatus = pickup.status;

    // --- BUSINESS RULES VALIDATION ---
    
    // 1. Cannot change if already Completed or Cancelled
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return res.status(400).json({ 
        message: `Action denied. Pickup is already ${currentStatus}.` 
      });
    }

    // 2. Pending -> Approved
    if (status === 'approved') {
      if (currentStatus !== 'pending') {
        return res.status(400).json({ message: 'Only pending pickups can be approved.' });
      }
      // Require Driver Details for approval
      if (!driverDetails || !driverDetails.name) {
        return res.status(400).json({ message: 'Driver details (Name) are required to approve.' });
      }
      pickup.driverDetails = driverDetails;
    }

    // 3. Approved -> Completed
    else if (status === 'completed') {
      if (currentStatus !== 'approved') {
        return res.status(400).json({ message: 'Pickup must be approved before completion.' });
      }
      // Require Waste Weight
      if (!wasteCollected || wasteCollected <= 0) {
        return res.status(400).json({ message: 'Please enter valid waste collected weight (kg).' });
      }
      pickup.wasteCollected = wasteCollected;
    }

    // 4. Cancelled (Can cancel from Pending or Approved)
    else if (status === 'cancelled') {
      if (!adminRemark) {
        return res.status(400).json({ message: 'Cancellation reason is required.' });
      }
    }

    // Update Fields
    pickup.status = status;
    if (adminRemark) pickup.adminRemark = adminRemark;

    await pickup.save();

    console.log(`✅ Pickup ${pickup._id} updated to ${status}`);
    res.status(200).json({ message: `Pickup marked as ${status}`, pickup });

  } catch (error) {
    console.error("Update Pickup Error:", error);
    res.status(500).json({ message: 'Server Error updating pickup' });
  }
};

// ==========================================
// 4. ISSUE MANAGEMENT
// ==========================================

const getAllIssues = async (req, res) => {
  try {
    const issues = await Report.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const resolveIssue = async (req, res) => {
  try {
    const issue = await Report.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = 'Resolved';
    issue.adminRemark = req.body.adminRemark || 'Resolved by admin';
    issue.resolvedAt = new Date();
    await issue.save();

    res.status(200).json({ message: 'Issue resolved successfully', issue });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateIssueStatus = async (req, res) => {
  res.status(200).json({ message: "Endpoint ready" });
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  adminHealthCheck,
  getAdminDashboard,
  getResidents,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  updateUserRole,
  getAllPickups,      // ✅ Exported
  getPickupById,      // ✅ Exported
  updatePickupStatus, // ✅ Exported
  getAllIssues,
  resolveIssue,
  updateIssueStatus
};