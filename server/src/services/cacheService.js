const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  // Initialize Redis client
  async initialize() {
    try {
      // Only initialize Redis if URL is provided
      if (process.env.REDIS_URL) {
        this.client = redis.createClient({
          url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('Redis client connected');
          this.isConnected = true;
        });

        this.client.on('ready', () => {
          console.log('Redis client ready');
          this.isConnected = true;
        });

        this.client.on('end', () => {
          console.log('Redis client disconnected');
          this.isConnected = false;
        });

        await this.client.connect();
      } else {
        console.log('Redis not configured. Caching will be disabled.');
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  // Generic get method
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Generic set method
  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cache entry
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete multiple cache entries by pattern
  async delPattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Product-specific cache methods
  async getProduct(productId) {
    return this.get(`product:${productId}`);
  }

  async setProduct(productId, productData, ttl = 1800) { // 30 minutes
    return this.set(`product:${productId}`, productData, ttl);
  }

  async invalidateProduct(productId) {
    await this.del(`product:${productId}`);
    await this.delPattern(`products:*`); // Invalidate product lists
  }

  // Product list cache methods
  async getProductList(cacheKey) {
    return this.get(`products:${cacheKey}`);
  }

  async setProductList(cacheKey, products, ttl = 600) { // 10 minutes
    return this.set(`products:${cacheKey}`, products, ttl);
  }

  // Category cache methods
  async getCategories() {
    return this.get('categories:all');
  }

  async setCategories(categories, ttl = 3600) { // 1 hour
    return this.set('categories:all', categories, ttl);
  }

  async invalidateCategories() {
    await this.del('categories:all');
  }

  // User cart cache methods
  async getUserCart(userId) {
    return this.get(`cart:${userId}`);
  }

  async setUserCart(userId, cartData, ttl = 1800) { // 30 minutes
    return this.set(`cart:${userId}`, cartData, ttl);
  }

  async invalidateUserCart(userId) {
    await this.del(`cart:${userId}`);
  }

  // Search results cache
  async getSearchResults(searchKey) {
    return this.get(`search:${searchKey}`);
  }

  async setSearchResults(searchKey, results, ttl = 300) { // 5 minutes
    return this.set(`search:${searchKey}`, results, ttl);
  }

  // Admin stats cache
  async getAdminStats() {
    return this.get('admin:stats');
  }

  async setAdminStats(stats, ttl = 300) { // 5 minutes
    return this.set('admin:stats', stats, ttl);
  }

  async invalidateAdminStats() {
    await this.del('admin:stats');
  }

  // Generate cache key for product queries
  generateProductCacheKey(query) {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      brand = '',
      minPrice = '',
      maxPrice = '',
      inStock = '',
      make = '',
      model = '',
      year = '',
      sortBy = ''
    } = query;

    return `list:${page}:${limit}:${search}:${category}:${brand}:${minPrice}:${maxPrice}:${inStock}:${make}:${model}:${year}:${sortBy}`;
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected || !this.client) {
      return { status: 'disabled', message: 'Redis not configured' };
    }

    try {
      await this.client.ping();
      return { status: 'healthy', message: 'Redis connection is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Close connection
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = new CacheService();