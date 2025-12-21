const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Category = require('../src/models/Category');
const { generateToken } = require('../src/utils/jwt');

describe('Admin API Endpoints', () => {
  let adminToken;
  let customerToken;
  let adminUser;
  let customerUser;
  let category;
  let product;
  let order;

  beforeEach(async () => {
    // Create test category
    category = await Category.create({
      name: 'Test Category',
      description: 'Test category for admin tests'
    });

    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '9876543210',
      role: 'admin'
    });
    adminToken = generateToken(adminUser._id);

    // Create customer user
    customerUser = await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@test.com',
      password: 'password123',
      phone: '9876543211',
      role: 'customer'
    });
    customerToken = generateToken(customerUser._id);

    // Create test product
    product = await Product.create({
      name: 'Test Product',
      description: 'Test product for admin tests',
      category: category._id,
      price: 100,
      brand: 'Test Brand',
      partNumber: 'TEST-001',
      stock: {
        quantity: 10,
        lowStockThreshold: 5
      }
    });

    // Create test order
    order = await Order.create({
      orderNumber: 'TEST-ORDER-001',
      customerId: customerUser._id,
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 2,
        subtotal: product.price * 2
      }],
      totalAmount: product.price * 2,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '9876543211'
      },
      paymentMethod: 'cod'
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should require admin role for admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should allow access with valid admin token', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Dashboard Statistics', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('recentOrders');
      expect(response.body.data.overview).toHaveProperty('totalProducts');
      expect(response.body.data.overview).toHaveProperty('totalCustomers');
      expect(response.body.data.overview).toHaveProperty('totalOrders');
    });
  });

  describe('Inventory Management', () => {
    it('should get inventory report', async () => {
      const response = await request(app)
        .get('/api/admin/inventory/report')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should get low stock products', async () => {
      // Create a low stock product
      await Product.create({
        name: 'Low Stock Product',
        description: 'Product with low stock',
        category: category._id,
        price: 50,
        brand: 'Test Brand',
        partNumber: 'LOW-001',
        stock: {
          quantity: 2,
          lowStockThreshold: 5
        }
      });

      const response = await request(app)
        .get('/api/admin/inventory/low-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should update product stock', async () => {
      const response = await request(app)
        .put(`/api/admin/inventory/stock/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 20,
          lowStockThreshold: 8
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.stock.quantity).toBe(20);
      expect(response.body.data.product.stock.lowStockThreshold).toBe(8);
    });

    it('should handle bulk product updates', async () => {
      const response = await request(app)
        .put('/api/admin/inventory/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          updates: [
            {
              productId: product._id,
              quantity: 25,
              price: 120
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.successful.length).toBe(1);
      expect(response.body.data.results.failed.length).toBe(0);
    });
  });

  describe('Order Management', () => {
    it('should get all orders', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });

    it('should get order by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/orders/${order._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.order._id).toBe(order._id.toString());
    });

    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'processing',
          notes: 'Order is being processed'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderStatus).toBe('processing');
      expect(response.body.data.order.notes).toBe('Order is being processed');
    });

    it('should reject invalid order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid-status'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });
  });

  describe('Analytics', () => {
    it('should get order analytics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/orders?period=30d')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('statusDistribution');
      expect(response.body.data).toHaveProperty('dailyTrends');
    });

    it('should get sales report', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/sales?period=30d&groupBy=day')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('salesTrends');
      expect(response.body.data).toHaveProperty('topProducts');
      expect(response.body.data).toHaveProperty('topCategories');
    });

    it('should get customer analytics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/customers?period=30d')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('topCustomers');
      expect(response.body.data).toHaveProperty('newCustomerTrends');
    });
  });

  describe('Data Export', () => {
    it('should export orders data as JSON', async () => {
      const response = await request(app)
        .get('/api/admin/export/orders?format=json')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('exportInfo');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });

    it('should export orders data as CSV', async () => {
      const response = await request(app)
        .get('/api/admin/export/orders?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Order Number');
    });

    it('should export products data as JSON', async () => {
      const response = await request(app)
        .get('/api/admin/export/products?format=json')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('exportInfo');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should export products data as CSV', async () => {
      const response = await request(app)
        .get('/api/admin/export/products?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Name');
    });
  });
});