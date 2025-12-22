const express = require('express');
const router = express.Router();

// --- MIDDLEWARE ---
const protect = require('../middleware/authMiddleware');
const { adminCheck } = require('../middleware/adminMiddleware');

// --- CONTROLLER IMPORTS ---
const { 
  adminHealthCheck,
  getAdminDashboard,
  getResidents,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  updateUserRole,
  getAllPickups,      // ✅ Pickups
  getPickupById,      // ✅ Pickups
  updatePickupStatus, // ✅ Pickups
  getAllIssues,
  resolveIssue,
  updateIssueStatus
} = require('../controllers/adminController');

// --- SAFETY CHECK (Debugging) ---
// This ensures you don't get "Handler must be a function" errors
const checkFunctions = { 
  getAllPickups, getPickupById, updatePickupStatus, 
  adminHealthCheck, getAdminDashboard 
};

for (const [key, fn] of Object.entries(checkFunctions)) {
  if (!fn) {
    console.error(`❌ FATAL ERROR: Controller function '${key}' is undefined. Check imports.`);
  }
}

// ==========================================
// 🔐 GLOBAL SECURITY
// ==========================================
// All routes below this line require Login + Admin Role
router.use(protect);
router.use(adminCheck);

// ==========================================
// 1. SYSTEM & DASHBOARD
// ==========================================
router.get('/health', adminHealthCheck);
router.get('/dashboard', getAdminDashboard);

// ==========================================
// 2. RESIDENT / USER MANAGEMENT
// ==========================================
router.get('/residents', getResidents);
router.get('/users', getAllUsers); // General user fetch
router.patch('/users/:id/block', toggleBlockUser); // Block/Unblock
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// ==========================================
// 3. PICKUP MANAGEMENT (✅ NEW)
// ==========================================
// GET /api/admin/pickups
router.get('/pickups', getAllPickups);

// GET /api/admin/pickups/:id
router.get('/pickups/:id', getPickupById);

// PATCH /api/admin/pickups/:id/status
// Handles: Approve (needs driver), Complete (needs weight), Cancel (needs reason)
router.patch('/pickups/:id/status', updatePickupStatus);

// ==========================================
// 4. ISSUE MANAGEMENT
// ==========================================
router.get('/issues', getAllIssues);
router.patch('/issues/:id/status', updateIssueStatus);
router.patch('/issues/:id/resolve', resolveIssue);

module.exports = router;