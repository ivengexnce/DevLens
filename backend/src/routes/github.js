const router = require('express').Router();
const { cacheMiddleware } = require('../middleware/cache');
const { profile, compare, discover, rateLimit } = require('../controllers/githubController');

router.get('/profile/:username', cacheMiddleware(300), profile);
router.get('/compare', cacheMiddleware(300), compare);
router.get('/discover', cacheMiddleware(600), discover);
router.get('/ratelimit', rateLimit);

module.exports = router;
