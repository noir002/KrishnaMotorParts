const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

describe('Checkout Conversion Tracking', () => {
  let authToken;
  let userId;
  let productId;
  let cartId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
      role: 'customer'
    });
    userId = user._id;

    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });
    authToken = loginRes.body.data.token;

    // Create a test product
    const product = await Product.create({
      name: 'Test Product',
      partNumber: 'TEST-001',
      price: 100,
      description: 'Test product description',
      category: new mongoose.Types.ObjectId(),
      brand: 'Test Brand',
      stock: {
        quantity: 50,
        inStock: true,
        lowStockThreshold: 10
      },
      images: ['https://example.com/test.jpg'],
      isActive: true
    });
    productId = product._id;

    // Create a cart with the product
    const cart = await Cart.create({
      userId: userId,
      items: [{
        productId: productId,
        quantity: 2
      }]
    });
    cartId = cart._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
  });

  describe('Conversion tracking with notifications', () => {
    it('should record conversion when cart has notifications sent', async () => {
      // Simulate abandoned cart with notifications sent
      const cart = await Cart.findById(cartId);
      cart.abandonmentTracking.isAbandoned = true;
      cart.abandonmentTracking.abandonedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      cart.abandonmentTracking.notificationsSent = 2;
      cart.abandonmentTracking.lastNotificationSent = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      cart.abandonmentTracking.notificationTimestamps = [
        new Date(Date.now() - 2 * 60 * 60 * 1000),
        new Date(Date.now() - 30 * 60 * 1000)
      ];
      await cart.save();

      // Create order (checkout)
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '9876543210'
          },
          paymentMethod: 'cod'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify conversion was recorded
      const updatedCart = await Cart.findById(cartId);
      expect(updatedCart.abandonmentTracking.convertedAfterNotification).toBe(true);
      expect(updatedCart.abandonmentTracking.conversionReminderNumber).toBe(2);
      expect(updatedCart.abandonmentTracking.conversionTimestamp).toBeDefined();
      expect(updatedCart.abandonmentTracking.timeToConversion).toBeDefined();
      expect(updatedCart.abandonmentTracking.timeToConversion).toBeGreaterThan(0);
    });

    it('should not record conversion when cart has no notifications sent', async () => {
      // Cart without notifications
      const cart = await Cart.findById(cartId);
      expect(cart.abandonmentTracking.notificationsSent).toBe(0);

      // Create order (checkout)
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '9876543210'
          },
          paymentMethod: 'cod'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify conversion was NOT recorded
      const updatedCart = await Cart.findById(cartId);
      expect(updatedCart.abandonmentTracking.convertedAfterNotification).toBe(false);
      expect(updatedCart.abandonmentTracking.conversionReminderNumber).toBeUndefined();
      expect(updatedCart.abandonmentTracking.conversionTimestamp).toBeUndefined();
    });

    it('should calculate time to conversion correctly', async () => {
      // Simulate abandoned cart with notification sent 1 hour ago
      const cart = await Cart.findById(cartId);
      const notificationTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      cart.abandonmentTracking.isAbandoned = true;
      cart.abandonmentTracking.abandonedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
      cart.abandonmentTracking.notificationsSent = 1;
      cart.abandonmentTracking.lastNotificationSent = notificationTime;
      cart.abandonmentTracking.notificationTimestamps = [notificationTime];
      await cart.save();

      // Create order (checkout)
      const beforeCheckout = Date.now();
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '9876543210'
          },
          paymentMethod: 'cod'
        });
      const afterCheckout = Date.now();

      // Verify time to conversion is approximately 1 hour (in milliseconds)
      const updatedCart = await Cart.findById(cartId);
      expect(updatedCart.abandonmentTracking.timeToConversion).toBeDefined();
      
      // Time should be approximately 1 hour (3600000 ms), with some tolerance
      const expectedTime = 60 * 60 * 1000; // 1 hour in ms
      const tolerance = 5000; // 5 seconds tolerance
      expect(updatedCart.abandonmentTracking.timeToConversion).toBeGreaterThan(expectedTime - tolerance);
      expect(updatedCart.abandonmentTracking.timeToConversion).toBeLessThan(expectedTime + tolerance);
    });
  });
});
