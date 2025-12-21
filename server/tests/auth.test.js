const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication System', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '9876543210'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.role).toBe('customer');
      expect(response.body.data.user.fullName).toBe('John Doe');
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should not register user with invalid phone', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          phone: '123456789' // Invalid phone (9 digits)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should register admin user when role is specified', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          role: 'admin'
        })
        .expect(201);

      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      phone: '9876543211'
    };

    beforeEach(async () => {
      // Register user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.lastLogin).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        phone: '9876543212'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(userId);
      expect(response.body.data.user.email).toBe('test.user@example.com');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      const userData = {
        firstName: 'Profile',
        lastName: 'Test',
        email: 'profile.test@example.com',
        password: 'password123',
        phone: '9876543213'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.token;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9876543214'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');
      expect(response.body.data.user.phone).toBe('9876543214');
    });

    it('should not update with invalid phone', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '123456789' // Invalid phone
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PHONE');
    });

    it('should not update with no valid fields', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'new@example.com' // Email updates not allowed
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_UPDATES');
    });
  });

  describe('Address Management', () => {
    let authToken;

    beforeEach(async () => {
      const userData = {
        firstName: 'Address',
        lastName: 'Test',
        email: 'address.test@example.com',
        password: 'password123',
        phone: '9876543215'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.data.token;
    });

    it('should add address successfully', async () => {
      const addressData = {
        type: 'home',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        isDefault: true
      };

      const response = await request(app)
        .post('/api/auth/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.addresses).toHaveLength(1);
      expect(response.body.data.user.addresses[0].street).toBe('123 Test Street');
      expect(response.body.data.user.addresses[0].isDefault).toBe(true);
    });

    it('should not add address with invalid pincode', async () => {
      const addressData = {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '12345' // Invalid pincode (5 digits)
      };

      const response = await request(app)
        .post('/api/auth/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PINCODE');
    });
  });
});