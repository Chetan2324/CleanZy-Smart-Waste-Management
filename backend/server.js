const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- MIDDLEWARE IMPORTS ---
const protect = require('./middleware/authMiddleware'); // Checks JWT Token
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware'); // Checks System Settings

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ===========================================
// 1. CORS CONFIGURATION
// ===========================================
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ===========================================
// 2. ROUTES
// ===========================================

// --- A. Auth Routes (Public) ---
// Note: Login/Register controllers have their own internal maintenance checks if needed.
// We do NOT apply maintenanceMiddleware here, or Admins gets locked out of Login.
app.use('/api/auth', require('./routes/auth'));

// --- B. Admin Routes (Protected by Admin Role) ---
// Admins must ALWAYS be able to access these, even during maintenance.
// Therefore, we do NOT add maintenanceMiddleware here.
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/pickups', require('./routes/adminPickup'));
app.use('/api/admin/settings', require('./routes/adminSettingsRoutes'));

// --- C. Citizen Features (Protected + Maintenance Enforced) ---
// These are the routes we want to BLOCK when the system is down.
// Execution Order:
// 1. protect: Verifies user is logged in (populates req.user)
// 2. maintenanceMiddleware: Checks if system is down AND user is Citizen
// 3. route handler: Executes if passed
app.use('/api/issues', protect, maintenanceMiddleware, require('./routes/issueRoutes'));
app.use('/api/pickups', protect, maintenanceMiddleware, require('./routes/pickup'));


// ===========================================
// 3. ERROR HANDLING
// ===========================================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));