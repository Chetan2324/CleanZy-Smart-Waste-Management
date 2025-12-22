const Schedule = require('../models/Schedule');

// @desc    Create a new pickup schedule
// @route   POST /api/schedule
// @access  Private
const createSchedule = async (req, res) => {
  try {
    const { wasteType, date, slot, location, instructions } = req.body;

    // Basic Validation
    if (!wasteType || !date || !slot) {
      return res.status(400).json({ message: 'Please provide waste type, date, and slot.' });
    }

    const newSchedule = new Schedule({
      user: req.user.id,
      wasteType,
      date,
      slot,
      location,
      instructions,
      status: 'Scheduled'
    });

    const savedSchedule = await newSchedule.save();

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully',
      schedule: savedSchedule
    });
  } catch (error) {
    console.error("Create Schedule Error:", error);
    res.status(500).json({ message: 'Server Error scheduling pickup' });
  }
};

// @desc    Get all pickups for the logged-in user
// @route   GET /api/schedule/my-pickups
// @access  Private
const getUserSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Get User Schedules Error:", error);
    res.status(500).json({ message: 'Server Error fetching schedules' });
  }
};

// @desc    Get single schedule details
// @route   GET /api/schedule/:id
// @access  Private
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Ensure user owns this schedule (or is admin)
    // Safe check: req.user.role might be undefined if not set in middleware, handled safely
    if (schedule.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this schedule' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Get Schedule By ID Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// EXPORT FUNCTIONS PROPERLY (Named Exports)
module.exports = {
  createSchedule,
  getUserSchedules,
  getScheduleById
};