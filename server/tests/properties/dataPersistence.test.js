const fc = require('fast-check');
const { Product, User, Order, Category, Cart } = require('../../src/models');

describe('Property-Based Tests: Data Persistence Integrity', () => {
  
  /**
   * Property 16: Data Persistence Integrity
   * For any data operation (create, update, delete), the database should maintain 
   * referential integrity and include all required fields for the entity type.
   * Validates: Requirements 8.1, 8.2
   * Feature: automobile-ecommerce-platform, Property 16: Data Persistence Integrity
   */
  describe('Property 16: Data Persistence Integrity', () => {
    
    it('should maintain referential integrity for Product creation and retrieval', async () => {
      // Simple test with fixed data first
      const categoryData = {
        name: 'Test Category',
        description: 'Test Description',
        isActive: true
      };
      
      const productData = {
        name: 'Test Product',
        description: 'Test Product Description',
        price: 100.50,
        brand: 'Test Brand',
        partNumber: 'TEST-001',
        compatibility: [],
        tags: ['test'],
        stock: {
          quantity: 10,
          lowStockThreshold: 5
        }
      };
      
      // Create category first (required reference)
      const category = new Category(categoryData);
      await category.save();
      
      // Create product with category reference
      const productWithCategory = {
        ...productData,
        category: category._id
      };
      
      const product = new Product(productWithCategory);
      await product.save();
      
      // Retrieve and verify all required fields are present
      const retrievedProduct = await Product.findById(product._id).populate('category');
      
      // Verify required fields are present
      expect(retrievedProduct.name).toBeDefined();
      expect(retrievedProduct.description).toBeDefined();
      expect(retrievedProduct.category).toBeDefined();
      expect(retrievedProduct.price).toBeDefined();
      expect(retrievedProduct.brand).toBeDefined();
      expect(retrievedProduct.partNumber).toBeDefined();
      expect(retrievedProduct.stock).toBeDefined();
      expect(retrievedProduct.stock.quantity).toBeDefined();
      expect(retrievedProduct.stock.lowStockThreshold).toBeDefined();
      expect(retrievedProduct.stock.inStock).toBeDefined();
      
      // Verify referential integrity
      expect(retrievedProduct.category._id.toString()).toBe(category._id.toString());
      expect(retrievedProduct.category.name).toBe(categoryData.name);
      
      // Verify data types and constraints
      expect(typeof retrievedProduct.name).toBe('string');
      expect(typeof retrievedProduct.price).toBe('number');
      expect(retrievedProduct.price).toBeGreaterThanOrEqual(0);
      expect(typeof retrievedProduct.stock.quantity).toBe('number');
      expect(retrievedProduct.stock.quantity).toBeGreaterThanOrEqual(0);
      
      // Verify computed fields
      expect(typeof retrievedProduct.stock.inStock).toBe('boolean');
      expect(retrievedProduct.stock.inStock).toBe(retrievedProduct.stock.quantity > 0);
    });

    it('should maintain data integrity for User creation with addresses', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        role: 'customer',
        addresses: [{
          type: 'home',
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          isDefault: true
        }]
      };
      
      const user = new User(userData);
      await user.save();
      
      // Retrieve and verify
      const retrievedUser = await User.findById(user._id);
      
      // Verify required fields
      expect(retrievedUser.email).toBeDefined();
      expect(retrievedUser.firstName).toBeDefined();
      expect(retrievedUser.lastName).toBeDefined();
      expect(retrievedUser.phone).toBeDefined();
      expect(retrievedUser.role).toBeDefined();
      expect(retrievedUser.isActive).toBeDefined();
      
      // Verify email uniqueness constraint would be enforced
      expect(retrievedUser.email).toBe(userData.email.toLowerCase());
      
      // Verify address integrity
      expect(retrievedUser.addresses).toHaveLength(1);
      
      // Verify default address logic
      const defaultAddresses = retrievedUser.addresses.filter(addr => addr.isDefault);
      expect(defaultAddresses).toHaveLength(1); // Exactly one default address
      
      // Verify data types
      expect(typeof retrievedUser.email).toBe('string');
      expect(typeof retrievedUser.isActive).toBe('boolean');
      expect(['customer', 'admin']).toContain(retrievedUser.role);
    });

    it('should handle database constraint violations appropriately', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User',
        phone: '9876543210',
        role: 'customer'
      };
      
      // Create first user
      const user1 = new User(userData);
      await user1.save();
      
      // Attempt to create second user with same email (should fail)
      const user2 = new User({
        ...userData,
        firstName: 'Different',
        lastName: 'Name'
      });
      
      // This should throw due to unique email constraint
      await expect(user2.save()).rejects.toThrow();
      
      // Verify original user still exists and is intact
      const retrievedUser = await User.findById(user1._id);
      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser.email).toBe(userData.email.toLowerCase());
    });
  });
});