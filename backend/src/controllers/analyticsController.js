const { isDBConnected } = require('../config/database');

let Analytics;
try { Analytics = require('../models/Analytics'); } catch {}

// GET /api/analytics/leaderboard
const leaderboard = async (req, res) => {
  if (!isDBConnected() || !Analytics) {
    return res.json({ leaderboard: [], dbEnabled: false });
  }
  try {
    const top = await Analytics.find({})
      .sort({ score: -1 })
      .limit(20)
      .select('username name avatarUrl score scoreLabel primaryLanguage totalStars followers searchCount');
    res.json({ leaderboard: top, dbEnabled: true });
  } catch (err) {
    res.json({ leaderboard: [], dbEnabled: false });
  }
};

// GET /api/analytics/trending
const trending = async (req, res) => {
  if (!isDBConnected() || !Analytics) {
    return res.json({ trending: [], dbEnabled: false });
  }
  try {
    const top = await Analytics.find({})
      .sort({ searchCount: -1 })
      .limit(10)
      .select('username avatarUrl score searchCount primaryLanguage');
    res.json({ trending: top, dbEnabled: true });
  } catch (err) {
    res.json({ trending: [], dbEnabled: false });
  }
};

module.exports = { leaderboard, trending };
