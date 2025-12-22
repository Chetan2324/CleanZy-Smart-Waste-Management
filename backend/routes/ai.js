const express = require('express');
const router = express.Router();
const { analyzeWaste } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// POST /api/ai/analyze
// We allow uploading an image (handled by 'upload') even though we analyze the text first
// This ensures the frontend code remains compatible.
router.post('/analyze', authMiddleware, upload.single('image'), analyzeWaste);

module.exports = router;