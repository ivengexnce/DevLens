const express = require('express');
const router = express.Router();
const {
    getProfile,
    getRepos,
    getScore,
    compareUsers,
    searchRepos,
    searchUsers,
    getRateLimit
} = require('../controllers/githubController');

router.get('/profile/:username', getProfile);
router.get('/repos/:username', getRepos);
router.get('/score/:username', getScore);
router.get('/compare/:user1/:user2', compareUsers);
router.get('/search', searchRepos);
router.get('/users', searchUsers);
router.get('/rate-limit', getRateLimit);

module.exports = router;