const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min TTL

const cacheMiddleware = (ttl = 300) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached) {
    return res.json({ ...cached, _cached: true });
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, data, ttl);
    return originalJson(data);
  };

  next();
};

module.exports = { cacheMiddleware, cache };
