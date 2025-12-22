const AdminActivityLog = require('../models/AdminActivityLog');

/**
 * Helper to create an immutable audit log entry.
 */
const logAdminAction = async ({ adminId, action, target, targetId = null, oldVal = null, newVal = null, req = null }) => {
  try {
    const metaData = req ? {
      ip: req.ip || req.connection.remoteAddress,
      device: req.headers['user-agent'] || 'Unknown'
    } : {};

    await AdminActivityLog.create({
      admin: adminId,
      actionType: action,
      targetType: target,
      targetId: targetId,
      previousValue: oldVal,
      newValue: newVal,
      meta: metaData
    });
    
  } catch (error) {
    // Log error but do not block the main request
    console.error("❌ AUDIT LOG ERROR:", error.message);
  }
};

module.exports = logAdminAction;