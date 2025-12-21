const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

describe('Product CRUD Operations', () => {
  let adminToken;
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    // Clean up any existing test data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ email: 'admin@test.com' });

    // Create admin user for authentication
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '9876543210',
      role: 'admin'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    adminToken = loginRes.body.data.token;

    // Create test category
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test category for products'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ email: 'admin@test.com' });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Brake Pad',
        description: 'High quality brake pad for cars',
        category: testCategory._id,
        price: 1500,
        brand: 'TestBrand',
        partNumber: 'TB001',
        compatibility: [{
          make: 'Toyota',
          model: 'Camry',
          year: 2020
        }],
        stock: {
          quantity: 50,
          lowStockThreshold: 10
        },
        tags: ['brake', 'safety']
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe(productData.name);
      expect(res.body.data.product.partNumber).toBe(productData.partNumber);
      expect(res.body.data.product.category.name).toBe(testCategory.name);

      testProduct = res.body.data.product;
    });

    it('should not create product without authentication', async () => {
      const productData = {
        name: 'Unauthorized Product',
        description: 'This should fail',
        category: testCategory._id,
        price: 1000,
        brand: 'TestBrand',
        partNumber: 'UNAUTH001'
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('GET /api/products', () => {
    beforeAll(async () => {
      // Ensure we have at least one product for testing
      if (!testProduct) {
        testProduct = await Product.create({
          name: 'Test Product for GET',
          description: 'Test product description',
          category: testCategory._id,
          price: 1200,
          brand: 'TestBrand',
          partNumber: 'TPGET001',
          stock: { quantity: 30 }
        });
      }
    });

    it('should get all products with pagination', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter products by price range', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=1000&maxPrice=2000')
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.products.length > 0) {
        res.body.data.products.forEach(product => {
          expect(product.price).toBeGreaterThanOrEqual(1000);
          expect(product.price).toBeLessThanOrEqual(2000);
        });
      }
    });

    it('should search products by text', async () => {
      const res = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get single product by ID', async () => {
      // Create a product specifically for this test
      const productForTest = await Product.create({
        name: 'Test Product for ID fetch',
        description: 'Test product description',
        category: testCategory._id,
        price: 1200,
        brand: 'TestBrand',
        partNumber: 'TPID001',
        stock: { quantity: 30 }
      });

      const res = await request(app)
        .get(`/api/products/${productForTest._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product._id).toBe(productForTest._id.toString());
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully', async () => {
      // Create admin user for this test
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin-update@test.com',
        password: 'password123',
        phone: '9876543211',
        role: 'admin'
      });

      // Login to get fresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin-update@test.com',
          password: 'password123'
        });

      const freshAdminToken = loginRes.body.data.token;

      // Create a product specifically for this test
      const productForUpdate = await Product.create({
        name: 'Test Product for Update',
        description: 'Test product description',
        category: testCategory._id,
        price: 1200,
        brand: 'TestBrand',
        partNumber: 'TPUPD001',
        stock: { quantity: 30 }
      });

      const updateData = {
        name: 'Updated Test Product',
        price: 1800
      };

      const res = await request(app)
        .put(`/api/products/${productForUpdate._id}`)
        .set('Authorization', `Bearer ${freshAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe(updateData.name);
      expect(res.body.data.product.price).toBe(updateData.price);
    });
  });

  describe('Vehicle Compatibility', () => {
    beforeAll(async () => {
      // Create a product with compatibility for testing
      await Product.create({
        name: 'Toyota Camry Filter',
        description: 'Air filter for Toyota Camry',
        category: testCategory._id,
        price: 500,
        brand: 'FilterBrand',
        partNumber: 'TF001',
        compatibility: [{
          make: 'Toyota',
          model: 'Camry',
          year: 2020
        }],
        stock: { quantity: 25 }
      });
    });

    it('should get products by vehicle compatibility', async () => {
      const res = await request(app)
        .get('/api/products/compatibility/Toyota/Camry/2020')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeInstanceOf(Array);
      expect(res.body.data.compatibility).toEqual({
        make: 'Toyota',
        model: 'Camry',
        year: 2020
      });
    });

    it('should get vehicle makes', async () => {
      const res = await request(app)
        .get('/api/products/compatibility/makes')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.makes).toBeInstanceOf(Array);
    });

    it('should get vehicle models for a make', async () => {
      const res = await request(app)
        .get('/api/products/compatibility/makes/Toyota/models')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.models).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft delete product successfully', async () => {
      // Create admin user for this test
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin-delete@test.com',
        password: 'password123',
        phone: '9876543212',
        role: 'admin'
      });

      // Login to get fresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin-delete@test.com',
          password: 'password123'
        });

      const freshAdminToken = loginRes.body.data.token;

      // Create a product specifically for this test
      const productForDelete = await Product.create({
        name: 'Test Product for Delete',
        description: 'Test product description',
        category: testCategory._id,
        price: 1200,
        brand: 'TestBrand',
        partNumber: 'TPDEL001',
        stock: { quantity: 30 }
      });

      const res = await request(app)
        .delete(`/api/products/${productForDelete._id}`)
        .set('Authorization', `Bearer ${freshAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('deactivated');

      // Verify product is not returned in public listing
      const getRes = await request(app)
        .get('/api/products')
        .expect(200);

      const foundProduct = getRes.body.data.products.find(p => p._id === productForDelete._id.toString());
      expect(foundProduct).toBeUndefined();
    });
  });
});