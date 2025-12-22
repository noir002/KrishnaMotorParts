const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
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
    description: 'High-quality ceramic brake pads for front wheels. Provides excellent stopping power and durability.',
    price: 2500,
    discountPrice: 2200,
    brand: 'Bosch',
    partNumber: 'BP-001-F',
    subcategory: 'Brake System',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Swift', year: 2018 },
      { make: 'Maruti Suzuki', model: 'Baleno', year: 2019 },
      { make: 'Hyundai', model: 'i20', year: 2020 }
    ],
    specifications: {
      material: 'Ceramic',
      thickness: '12mm',
      width: '150mm',
      height: '60mm'
    },
    images: [
      'https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png'
    ],
    stock: {
      quantity: 25,
      lowStockThreshold: 5,
      inStock: true
    },
    tags: ['brake', 'safety', 'ceramic'],
    isActive: true
  },
  {
    name: 'Engine Oil Filter',
    description: 'Premium oil filter for optimal engine performance. Removes contaminants and extends engine life.',
    price: 450,
    discountPrice: 380,
    brand: 'Mann Filter',
    partNumber: 'OF-002',
    subcategory: 'Engine Components',
    compatibility: [
      { make: 'Tata', model: 'Nexon', year: 2021 },
      { make: 'Tata', model: 'Harrier', year: 2020 },
      { make: 'Mahindra', model: 'XUV300', year: 2019 }
    ],
    specifications: {
      filterType: 'Spin-on',
      threadSize: '3/4-16 UNF',
      height: '95mm',
      diameter: '76mm'
    },
    images: [
      'https://www.pgfilters.com/wp-content/uploads/2023/02/AdobeStock_485635853.jpeg'
    ],
    stock: {
      quantity: 50,
      lowStockThreshold: 10,
      inStock: true
    },
    tags: ['filter', 'engine', 'maintenance'],
    isActive: true
  },
  {
    name: 'LED Headlight Bulb H4',
    description: 'Super bright LED headlight bulb with 6000K white light. Energy efficient and long-lasting.',
    price: 1200,
    discountPrice: 999,
    brand: 'Philips',
    partNumber: 'LED-H4-001',
    subcategory: 'Lighting',
    compatibility: [
      { make: 'Honda', model: 'City', year: 2018 },
      { make: 'Honda', model: 'Amaze', year: 2019 },
      { make: 'Toyota', model: 'Innova', year: 2017 }
    ],
    specifications: {
      bulbType: 'H4',
      wattage: '24W',
      voltage: '12V',
      colorTemperature: '6000K',
      lumens: '3000lm'
    },
    images: [
      'https://i.ebayimg.com/images/g/XK4AAOSwKmRj0yhu/s-l1600.webp'
    ],
    stock: {
      quantity: 30,
      lowStockThreshold: 8,
      inStock: true
    },
    tags: ['led', 'headlight', 'bright'],
    isActive: true
  },
  {
    name: 'Side Mirror Assembly - Right',
    description: 'Complete side mirror assembly with electric adjustment and heating function.',
    price: 3500,
    brand: 'OEM',
    partNumber: 'SM-R-003',
    subcategory: 'Mirrors',
    compatibility: [
      { make: 'Hyundai', model: 'Creta', year: 2020 },
      { make: 'Hyundai', model: 'Venue', year: 2021 }
    ],
    specifications: {
      adjustment: 'Electric',
      heating: 'Yes',
      color: 'Black',
      mirrorSize: '180x120mm'
    },
    images: [
      'https://m.media-amazon.com/images/I/91hffoF34BL._SL1500_.jpg'
    ],
    stock: {
      quantity: 15,
      lowStockThreshold: 3,
      inStock: true
    },
    tags: ['mirror', 'electric', 'heated'],
    isActive: true
  },
  {
    name: 'Windshield Wiper Blade Set',
    description: 'Premium rubber wiper blades for clear visibility in all weather conditions.',
    price: 800,
    discountPrice: 650,
    brand: 'Bosch',
    partNumber: 'WB-SET-004',
    subcategory: 'Wipers',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Alto', year: 2019 },
      { make: 'Maruti Suzuki', model: 'WagonR', year: 2020 },
      { make: 'Nissan', model: 'Micra', year: 2018 }
    ],
    specifications: {
      length: '22/16 inches',
      material: 'Natural Rubber',
      frameType: 'Conventional'
    },
    images: [
      'https://i.ebayimg.com/images/g/eLAAAOSwOHlk8f6K/s-l1600.webp'
    ],
    stock: {
      quantity: 40,
      lowStockThreshold: 10,
      inStock: true
    },
    tags: ['wiper', 'rubber', 'visibility'],
    isActive: true
  },
  {
    name: 'Mobil 1 Synthetic Engine Oil 5W-30',
    description: 'Premium synthetic engine oil for superior engine protection and performance.',
    price: 2800,
    discountPrice: 2500,
    brand: 'Mobil',
    partNumber: 'MOB-5W30-5L',
    subcategory: 'Engine Oil',
    compatibility: [
      { make: 'BMW', model: '3 Series', year: 2019 },
      { make: 'Audi', model: 'A4', year: 2020 },
      { make: 'Mercedes', model: 'C-Class', year: 2018 }
    ],
    specifications: {
      viscosity: '5W-30',
      volume: '5 Liters',
      type: 'Fully Synthetic',
      apiRating: 'SN/CF'
    },
    images: [
      'https://www.shutterstock.com/shutterstock/photos/2488384121/display_1500/stock-photo-kedah-malaysia-july-a-bottles-castrol-magnatec-fully-synthetic-w-engine-oil-close-2488384121.jpg'
    ],
    stock: {
      quantity: 20,
      lowStockThreshold: 5,
      inStock: true
    },
    tags: ['oil', 'synthetic', 'premium'],
    isActive: true
  },
  {
    name: 'Timing Belt Kit',
    description: 'Complete timing belt kit with tensioner and idler pulleys for reliable engine timing.',
    price: 4500,
    discountPrice: 3800,
    brand: 'Gates',
    partNumber: 'TB-KIT-005',
    subcategory: 'Engine Timing',
    compatibility: [
      { make: 'Volkswagen', model: 'Polo', year: 2018 },
      { make: 'Skoda', model: 'Rapid', year: 2019 },
      { make: 'Volkswagen', model: 'Vento', year: 2017 }
    ],
    specifications: {
      beltLength: '1200mm',
      teeth: '120',
      width: '25mm',
      includes: 'Belt, Tensioner, Idler Pulley'
    },
    images: [
      'https://5.imimg.com/data5/KI/IT/CI/SELLER-786246/timing-belt-1000x1000.jpg'
    ],
    stock: {
      quantity: 12,
      lowStockThreshold: 3,
      inStock: true
    },
    tags: ['timing', 'belt', 'kit'],
    isActive: true
  },
  {
    name: 'Radiator Coolant - Green',
    description: 'High-performance engine coolant with anti-freeze and anti-corrosion properties.',
    price: 600,
    discountPrice: 520,
    brand: 'Prestone',
    partNumber: 'RC-GREEN-1L',
    subcategory: 'Cooling System',
    compatibility: [
      { make: 'Ford', model: 'EcoSport', year: 2019 },
      { make: 'Ford', model: 'Figo', year: 2020 },
      { make: 'Chevrolet', model: 'Beat', year: 2018 }
    ],
    specifications: {
      color: 'Green',
      volume: '1 Liter',
      freezingPoint: '-37°C',
      boilingPoint: '108°C'
    },
    images: [
      'https://cdn11.bigcommerce.com/s-eqgv9kc7pj/images/stencil/1280x1280/products/5607/9836/Prime_Antifreeze-6__17207.1756384741.png?c=2'
    ],
    stock: {
      quantity: 35,
      lowStockThreshold: 8,
      inStock: true
    },
    tags: ['coolant', 'antifreeze', 'green'],
    isActive: true
  }
];

const sampleUsers = [
  {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'customer'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '9876543211',
    role: 'admin'
  },
  {
    firstName: 'Krishna',
    lastName: 'Motor Parts',
    email: 'krishnamotorparts1993@gmail.com',
    password: 'admin123',
    phone: '8630373030',
    role: 'admin'
  },
  {
    firstName: 'Demo',
    lastName: 'Customer',
    email: 'demo@test.com',
    password: '123456',
    phone: '9876543212',
    role: 'customer'
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

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert categories one by one to handle slug generation
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

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();