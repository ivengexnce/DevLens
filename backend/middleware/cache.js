const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 min default
  checkperiod: 60,
  useClones: false,
});

/**
 * Express middleware — caches GET responses by URL
 * Usage: router.get('/path', cacheMiddleware(), controller)
 */
const cacheMiddleware = (ttl) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `__cache__${req.originalUrl}`;
  const cached = cache.get(key);

  if (cached) {
    return res.json({ ...cached, _cached: true });
  }

  // Intercept res.json to store result
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode === 200) {
      cache.set(key, data, ttl || parseInt(process.env.CACHE_TTL) || 300);
    }
    return originalJson(data);
  };

  next();
};

const clearCache = (pattern) => {
  const keys = cache.keys().filter(k => k.includes(pattern));
  keys.forEach(k => cache.del(k));
  return keys.length;
};

const getCacheStats = () => cache.getStats();

module.exports = { cacheMiddleware, clearCache, getCacheStats, cache };
