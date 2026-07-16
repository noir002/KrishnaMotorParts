const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const { generateToken } = require('../src/utils/jwt');

describe('Admin Abandoned Cart Analytics API', () => {
  let adminToken;
  let customerToken;
  let adminUser;
  let customerUser;
  let category;
  let product;

  beforeEach(async () => {
    // Create test category
    category = await Category.create({
      name: 'Test Category',
      description: 'Test category for analytics tests'
    });

    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@analytics.com',
      password: 'password123',
      phone: '9876543210',
      role: 'admin'
    });
    adminToken = generateToken(adminUser._id);

    // Create customer user
    customerUser = await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@analytics.com',
      password: 'password123',
      phone: '9876543211',
      role: 'customer'
    });
    customerToken = generateToken(customerUser._id);

    // Create test product
    product = await Product.create({
      name: 'Test Product',
      description: 'Test product for analytics',
      category: category._id,
      price: 100,
      brand: 'Test Brand',
      partNumber: 'TEST-001',
      stock: {
        quantity: 10,
        lowStockThreshold: 5
      }
    });
  });

  describe('GET /api/admin/abandoned-carts/stats', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return comprehensive statistics for admin', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('abandonmentRate');
      expect(response.body.data).toHaveProperty('recoveryRate');
      expect(response.body.data).toHaveProperty('revenueRecovered');
      expect(response.body.data).toHaveProperty('conversionsByReminder');
      expect(response.body.data).toHaveProperty('averageConversionTime');
    });

    it('should accept date range filters', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const response = await request(app)
        .get(`/api/admin/abandoned-carts/stats?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dateRange).toBeDefined();
    });

    it('should reject invalid date formats', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts/stats?startDate=invalid-date')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DATE');
    });
  });

  describe('GET /api/admin/abandoned-carts', () => {
    beforeEach(async () => {
      // Create abandoned cart
      await Cart.create({
        userId: customerUser._id,
        items: [{
          productId: product._id,
          quantity: 2,
          price: product.price
        }],
        totalItems: 2,
        totalAmount: product.price * 2,
        abandonmentTracking: {
          isAbandoned: true,
          abandonedAt: new Date(),
          notificationsSent: 1,
          lastNotificationSent: new Date()
        },
        lastModifiedAt: new Date()
      });
    });

    it('should return paginated list of abandoned carts', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('carts');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.carts)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(10);
    });

    it('should filter by conversion status', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts?status=not_converted')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter by notification count', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts?notificationCount=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/abandoned-carts/conversions', () => {
    it('should return conversion metrics', async () => {
      const response = await request(app)
        .get('/api/admin/abandoned-carts/conversions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversionsByReminder');
      expect(response.body.data).toHaveProperty('averageConversionTime');
      expect(response.body.data).toHaveProperty('recoveryRate');
      expect(response.body.data).toHaveProperty('revenueRecovered');
    });

    it('should accept date range filters', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const response = await request(app)
        .get(`/api/admin/abandoned-carts/conversions?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dateRange).toBeDefined();
    });
  });
});
