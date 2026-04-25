const { getProfile, getRepos, getEvents, searchUsers, getRateLimit } = require('../config/github');
const { calcScore, calcAnalytics, buildHeatmap, scoreLabel } = require('../utils/scoring');
const { isDBConnected } = require('../config/database');

let Analytics;
try { Analytics = require('../models/Analytics'); } catch {}

// GET /api/github/profile/:username
const profile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const [profileData, repos, events] = await Promise.all([
      getProfile(username),
      getRepos(username),
      getEvents(username)
    ]);

    const analytics = calcAnalytics(repos);
    const scoring = calcScore(profileData, repos);
    const heatmap = buildHeatmap(events);
    const label = scoreLabel(scoring.total);

    // Save to DB if connected
    if (isDBConnected() && Analytics) {
      Analytics.findOneAndUpdate(
        { username: username.toLowerCase() },
        {
          username: username.toLowerCase(),
          score: scoring.total,
          scoreLabel: label,
          totalRepos: analytics.totalRepos,
          totalStars: analytics.totalStars,
          primaryLanguage: analytics.primaryLanguage,
          followers: profileData.followers,
          avatarUrl: profileData.avatar_url,
          name: profileData.name,
          lastSearched: new Date(),
          $inc: { searchCount: 1 }
        },
        { upsert: true, new: true }
      ).catch(() => {});
    }

    res.json({
      profile: {
        username: profileData.login,
        name: profileData.name,
        bio: profileData.bio,
        avatar: profileData.avatar_url,
        location: profileData.location,
        company: profileData.company,
        blog: profileData.blog,
        followers: profileData.followers,
        following: profileData.following,
        publicRepos: profileData.public_repos,
        githubUrl: profileData.html_url,
        createdAt: profileData.created_at
      },
      scoring: { ...scoring, label },
      analytics,
      heatmap
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `User "${req.params.username}" not found on GitHub` });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit reached. Add a GitHub token or try later.' });
    }
    next(err);
  }
};

// GET /api/github/compare?u1=user1&u2=user2
const compare = async (req, res, next) => {
  try {
    const { u1, u2 } = req.query;
    if (!u1 || !u2) return res.status(400).json({ error: 'Provide ?u1=user1&u2=user2' });

    const fetchUser = async (username) => {
      const [profileData, repos] = await Promise.all([
        getProfile(username),
        getRepos(username)
      ]);
      const analytics = calcAnalytics(repos);
      const scoring = calcScore(profileData, repos);
      return {
        profile: {
          username: profileData.login,
          name: profileData.name,
          avatar: profileData.avatar_url,
          followers: profileData.followers,
          publicRepos: profileData.public_repos,
          githubUrl: profileData.html_url
        },
        scoring: { ...scoring, label: scoreLabel(scoring.total) },
        analytics
      };
    };

    const [user1, user2] = await Promise.all([fetchUser(u1), fetchUser(u2)]);
    res.json({ user1, user2 });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    next(err);
  }
};

// GET /api/github/discover?language=javascript&sort=followers
const discover = async (req, res, next) => {
  try {
    const { language = 'javascript', sort = 'followers' } = req.query;
    const users = await searchUsers('repos:>10', language, sort);

    const results = users.slice(0, 12).map(u => ({
      username: u.login,
      avatar: u.avatar_url,
      githubUrl: u.html_url
    }));

    res.json({ users: results });
  } catch (err) {
    next(err);
  }
};

// GET /api/github/ratelimit
const rateLimit = async (req, res, next) => {
  try {
    const data = await getRateLimit();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { profile, compare, discover, rateLimit };
