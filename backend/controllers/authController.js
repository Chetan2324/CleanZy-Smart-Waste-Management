const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Settings = require('../models/Settings'); 

// Helper: Generate JWT
const generateToken = (id, role, tokenVersion) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env");
  }
  return jwt.sign({ 
    id, 
    role, 
    tokenVersion 
  }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new Resident (Public)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // 1. Maintenance Check
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
      return res.status(503).json({ message: 'Registration is closed due to system maintenance.' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'resident', 
      tokenVersion: 0 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.tokenVersion),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Login User (Admin or Resident)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate Input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Find User
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Maintenance Check (With Admin Bypass)
    const settings = await Settings.findOne();
    
    if (settings?.maintenanceMode) {
      // Check role case-insensitively
      const role = user.role ? user.role.toLowerCase() : '';
      
      // If NOT Admin, block login
      if (role !== 'admin' && role !== 'administrator') {
        return res.status(503).json({ 
          message: 'System is under maintenance. Citizen login is temporarily disabled.' 
        });
      }
    }

    // 5. Security Check: Is Blocked?
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    // 6. Update Login History (Silent)
    try {
      if (!user.loginHistory) user.loginHistory = [];
      user.loginHistory.push({
        date: new Date(),
        ip: req.ip,
        device: req.headers['user-agent'] || 'Unknown'
      });
      await user.save();
    } catch (err) {
      // Ignore history update errors
    }

    // 7. Send Response
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, 
      token: generateToken(user._id, user.role, user.tokenVersion),
      settings: user.settings 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};