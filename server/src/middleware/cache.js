const cacheService = require('../services/cacheService');

// Generic cache middleware
const cache = (keyGenerator, ttl = 600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache successful responses
      res.json = function(data) {
        if (res.statusCode === 200 && data.success) {
          cacheService.set(cacheKey, data, ttl);
          console.log(`Data cached for key: ${cacheKey}`);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching on error
    }
  };
};

// Product list cache middleware
const cacheProductList = cache((req) => {
  return `products:${cacheService.generateProductCacheKey(req.query)}`;
}, 600); // 10 minutes

// Single product cache middleware
const cacheProduct = cache((req) => {
  return `product:${req.params.id}`;
}, 1800); // 30 minutes

// Categories cache middleware
const cacheCategories = cache('categories:all', 3600); // 1 hour

// Search results cache middleware
const cacheSearchResults = cache((req) => {
  const searchTerm = req.query.search || '';
  const filters = JSON.stringify({
    category: req.query.category,
    brand: req.query.brand,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    inStock: req.query.inStock
  });
  return `search:${Buffer.from(searchTerm + filters).toString('base64')}`;
}, 300); // 5 minutes

// Admin stats cache middleware
const cacheAdminStats = cache('admin:stats', 300); // 5 minutes

module.exports = {
  cache,
  cacheProductList,
  cacheProduct,
  cacheCategories,
  cacheSearchResults,
  cacheAdminStats
};