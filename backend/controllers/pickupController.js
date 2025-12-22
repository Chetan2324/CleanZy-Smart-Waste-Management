const Pickup = require('../models/Pickup');
const User = require('../models/User');

// @desc    Create a new pickup request
// @route   POST /api/pickups
// @access  Private (Resident)
const createPickup = async (req, res) => {
  try {
    const { wasteType, address, scheduledDate, instructions } = req.body;

    // 1. Validation
    if (!wasteType || !address || !scheduledDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 2. Fetch User Snapshot
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 3. Create Pickup with Initial Timeline
    const pickup = await Pickup.create({
      user: req.user._id,
      userName: user.name,
      email: user.email,
      wasteType,
      address,
      scheduledDate,
      instructions, // Optional field
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          changedBy: user.name,
          date: new Date(),
          remark: 'Request created'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      pickup
    });

  } catch (error) {
    console.error("Create Pickup Error:", error);
    res.status(500).json({ message: 'Server Error scheduling pickup' });
  }
};

// @desc    Get logged-in user's history
// @route   GET /api/pickups/my-pickups
// @access  Private (Resident)
const getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Newest first
    res.status(200).json(pickups);
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ message: 'Server Error fetching history' });
  }
};

// @desc    Cancel a pickup (Resident only)
// @route   PATCH /api/pickups/:id/cancel
// @access  Private (Resident)
const cancelPickupByResident = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({ _id: req.params.id, user: req.user._id });

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Strict Rule: Residents can only cancel 'pending' pickups
    if (pickup.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel. Pickup is already processed.' });
    }

    pickup.status = 'cancelled';
    pickup.adminRemark = 'Cancelled by Resident';
    
    // Update Timeline
    pickup.timeline.push({
      status: 'cancelled',
      changedBy: req.user.name,
      date: new Date(),
      remark: 'User changed mind'
    });

    await pickup.save();

    res.status(200).json({ success: true, message: 'Pickup cancelled', pickup });

  } catch (error) {
    console.error("Cancel Pickup Error:", error);
    res.status(500).json({ message: 'Server Error cancelling pickup' });
  }
};

module.exports = {
  createPickup,
  getMyPickups,
  cancelPickupByResident // ✅ NEW Export
};