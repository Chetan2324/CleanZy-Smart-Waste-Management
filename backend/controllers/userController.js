const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get logged in user profile
// @route   GET /api/user/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already fetched by authMiddleware
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update User Settings
// @route   PUT /api/user/settings
// @access  Private
const updateSettings = async (req, res) => {
  const { preferredPickupTime, defaultWasteType, emailNotifications, name } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Settings
    if (preferredPickupTime) user.settings.preferredPickupTime = preferredPickupTime;
    if (defaultWasteType) user.settings.defaultWasteType = defaultWasteType;
    if (emailNotifications !== undefined) user.settings.notifications = emailNotifications; // Fixed to match schema key 'notifications'

    // Update Basic Info if provided
    if (name) user.name = name;

    await user.save();

    res.json({ 
      success: true, 
      message: 'Settings updated successfully',
      user: {
        name: user.name,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Change Password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // We need the password here, so we fetch it explicitly
    const user = await User.findById(req.user.id);

    // 1. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // 2. Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 3. Optional: Logout other sessions on password change
    user.tokenVersion += 1;

    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Logout from all devices
// @route   POST /api/user/logout-all
// @access  Private
const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Incrementing tokenVersion invalidates all existing JWTs 
    // because authMiddleware checks if token.version == user.version
    user.tokenVersion += 1;
    
    await user.save();

    res.json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getMe,
  updateSettings,
  changePassword,
  logoutAllDevices
};