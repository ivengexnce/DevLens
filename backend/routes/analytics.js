const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/stats/global', analyticsController.getGlobalStats);
router.get('/rank/:username', analyticsController.getRank);
router.get('/:username', analyticsController.getAnalytics);

module.exports = router;