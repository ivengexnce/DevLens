const router = require('express').Router();
const { leaderboard, trending } = require('../controllers/analyticsController');

router.get('/leaderboard', leaderboard);
router.get('/trending', trending);

module.exports = router;
