const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// GET /api/ai/insights/:username
router.get('/insights/:username', aiController.getInsights);

// POST /api/ai/compare
router.post('/compare', aiController.compareUsers);

module.exports = router;