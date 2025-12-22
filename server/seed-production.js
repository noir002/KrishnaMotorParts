// Run this script once after deploying to production
// Replace the MONGODB_URI with your actual connection string
// Then run: node seed-production.js

const mongoose = require('mongoose');

// Use your production MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://paraschauhan:Paras@1234@krishnamotorparts.6qljhwh.mongodb.net/automobile_ecommerce?retryWrites=true&w=majority&appName=KrishnaMotorParts';

// Import models
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleCategories = [
  {
    name: 'Spare Parts',
    description: 'General automobile spare parts',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Tractor Parts',
    description: 'Parts for tractors and heavy machinery',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Lights',
    description: 'Headlights, taillights, and indicators',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Mirrors',
    description: 'Side mirrors and rear view mirrors',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Glass & Windshield',
    description: 'Windshields and window glass',
    isActive: true,
    sortOrder: 5
  }
];

const sampleProducts = [
  {
    name: 'Brake Pad Set - Front',
    description: 'High-quality ceramic brake pads for front wheels.',
    price: 2500,
    discountPrice: 2200,
    brand: 'Bosch',
    partNumber: 'BP-001-F',
    subcategory: 'Brake System',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Swift', year: 2018 }
    ],
    specifications: {
      material: 'Ceramic',
      thickness: '12mm'
    },
    images: [
      'https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png'
    ],
    stock: {
      quantity: 25,
      lowStockThreshold: 5,
      inStock: true
    },
    tags: ['brake', 'safety'],
    isActive: true
  },
  {
    name: 'Engine Oil Filter',
    description: 'Premium oil filter for optimal engine performance.',
    price: 450,
    discountPrice: 380,
    brand: 'Mann Filter',
    partNumber: 'OF-002',
    subcategory: 'Engine Components',
    compatibility: [
      { make: 'Tata', model: 'Nexon', year: 2021 }
    ],
    specifications: {
      filterType: 'Spin-on'
    },
    images: [
      'https://www.pgfilters.com/wp-content/uploads/2023/02/AdobeStock_485635853.jpeg'
    ],
    stock: {
      quantity: 50,
      lowStockThreshold: 10,
      inStock: true
    },
    tags: ['filter', 'engine'],
    isActive: true
  },
  {
    name: 'LED Headlight Bulb H4',
    description: 'Super bright LED headlight bulb with 6000K white light.',
    price: 1200,
    discountPrice: 999,
    brand: 'Philips',
    partNumber: 'LED-H4-001',
    subcategory: 'Lighting',
    compatibility: [
      { make: 'Honda', model: 'City', year: 2018 }
    ],
    specifications: {
      bulbType: 'H4',
      wattage: '24W'
    },
    images: [
      'https://i.ebayimg.com/images/g/XK4AAOSwKmRj0yhu/s-l1600.webp'
    ],
    stock: {
      quantity: 30,
      lowStockThreshold: 8,
      inStock: true
    },
    tags: ['led', 'headlight'],
    isActive: true
  }
];

const sampleUsers = [
  {
    firstName: 'Krishna',
    lastName: 'Motor Parts',
    email: 'krishnamotorparts1993@gmail.com',
    password: 'admin123',
    phone: '8630373030',
    role: 'admin'
  },
  {
    firstName: 'Paras',
    lastName: 'Chauhan',
    email: 'chauhanparas7500@gmail.com',
    password: 'Paras@1234',
    phone: '9389333504',
    role: 'customer'
  }
];

const seedProduction = async () => {
  try {
    console.log('🌱 Starting production database seeding...');

    // Insert categories
    const categories = [];
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      await category.save();
      categories.push(category);
    }
    console.log(`✅ Inserted ${categories.length} categories`);

    // Assign category IDs to products
    const productsWithCategories = sampleProducts.map((product, index) => {
      const categoryIndex = index % categories.length;
      return {
        ...product,
        category: categories[categoryIndex]._id
      };
    });

    // Insert products
    const products = await Product.insertMany(productsWithCategories);
    console.log(`✅ Inserted ${products.length} products`);

    // Insert users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`✅ Inserted ${users.length} users`);

    console.log('🎉 Production database seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding production database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedProduction();