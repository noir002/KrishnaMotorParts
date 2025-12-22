// Run this script once after deploying to production
// Replace the MONGODB_URI with your actual connection string
// Then run: node seed-production.js

const mongoose = require('mongoose');

// Use your production MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://paraschauhan:Paras%401234@krishnamotorparts.6qljhwh.mongodb.net/automobile_ecommerce?retryWrites=true&w=majority&appName=KrishnaMotorParts';

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
    name: 'LED Headlight Bulb H4',
    description: 'Super bright LED headlight bulb with 6000K white light. Perfect replacement for halogen bulbs.',
    price: 1200,
    discountPrice: 999,
    brand: 'Philips',
    partNumber: 'LED-H4-001',
    subcategory: 'Lighting',
    compatibility: [
      { make: 'Honda', model: 'City', year: 2018 },
      { make: 'Maruti Suzuki', model: 'Swift', year: 2019 }
    ],
    specifications: {
      bulbType: 'H4',
      wattage: '24W',
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
    tags: ['led', 'headlight', 'lighting'],
    isActive: true
  },
  {
    name: 'Windshield Wiper Blades',
    description: 'Premium quality windshield wiper blades for clear visibility in all weather conditions.',
    price: 800,
    discountPrice: 650,
    brand: 'Bosch',
    partNumber: 'WB-22-001',
    subcategory: 'Wipers',
    compatibility: [
      { make: 'Tata', model: 'Nexon', year: 2020 },
      { make: 'Hyundai', model: 'Creta', year: 2021 }
    ],
    specifications: {
      length: '22 inch',
      type: 'Flat blade'
    },
    images: [
      'https://images.shutterstock.com/image-photo/car-windshield-wiper-blade-isolated-600nw-1925419537.jpg'
    ],
    stock: {
      quantity: 45,
      lowStockThreshold: 10,
      inStock: true
    },
    tags: ['wiper', 'windshield', 'safety'],
    isActive: true
  },
  {
    name: 'Engine Oil 5W-30',
    description: 'High-performance synthetic engine oil for optimal engine protection and fuel efficiency.',
    price: 2500,
    discountPrice: 2200,
    brand: 'Castrol',
    partNumber: 'EO-5W30-4L',
    subcategory: 'Engine Oil',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Baleno', year: 2019 },
      { make: 'Honda', model: 'Amaze', year: 2020 }
    ],
    specifications: {
      viscosity: '5W-30',
      volume: '4 Liters',
      type: 'Synthetic'
    },
    images: [
      'https://images.shutterstock.com/image-photo/motor-oil-plastic-bottle-isolated-600nw-1434593966.jpg'
    ],
    stock: {
      quantity: 20,
      lowStockThreshold: 5,
      inStock: true
    },
    tags: ['engine', 'oil', 'synthetic'],
    isActive: true
  },
  {
    name: 'Timing Belt Kit',
    description: 'Complete timing belt kit with tensioner and idler pulleys for reliable engine timing.',
    price: 3500,
    discountPrice: 3200,
    brand: 'Gates',
    partNumber: 'TB-KIT-001',
    subcategory: 'Engine Components',
    compatibility: [
      { make: 'Tata', model: 'Tiago', year: 2018 },
      { make: 'Mahindra', model: 'XUV300', year: 2019 }
    ],
    specifications: {
      teeth: '136',
      width: '25mm',
      includes: 'Belt, Tensioner, Pulleys'
    },
    images: [
      'https://images.shutterstock.com/image-photo/timing-belt-kit-car-engine-600nw-1456789123.jpg'
    ],
    stock: {
      quantity: 15,
      lowStockThreshold: 3,
      inStock: true
    },
    tags: ['timing', 'belt', 'engine'],
    isActive: true
  },
  {
    name: 'Radiator Coolant',
    description: 'Premium radiator coolant for optimal engine temperature control and corrosion protection.',
    price: 450,
    discountPrice: 380,
    brand: 'Prestone',
    partNumber: 'RC-1L-001',
    subcategory: 'Cooling System',
    compatibility: [
      { make: 'Hyundai', model: 'i20', year: 2020 },
      { make: 'Kia', model: 'Seltos', year: 2021 }
    ],
    specifications: {
      volume: '1 Liter',
      type: 'Ethylene Glycol',
      protection: '-37°C to +106°C'
    },
    images: [
      'https://images.shutterstock.com/image-photo/car-coolant-antifreeze-bottle-isolated-600nw-1567890234.jpg'
    ],
    stock: {
      quantity: 35,
      lowStockThreshold: 8,
      inStock: true
    },
    tags: ['coolant', 'radiator', 'cooling'],
    isActive: true
  },
  {
    name: 'Oil Filter',
    description: 'High-efficiency oil filter for clean engine oil circulation and extended engine life.',
    price: 350,
    discountPrice: 299,
    brand: 'Mann Filter',
    partNumber: 'OF-002',
    subcategory: 'Filters',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Swift', year: 2018 },
      { make: 'Tata', model: 'Nexon', year: 2021 }
    ],
    specifications: {
      filterType: 'Spin-on',
      thread: 'M20 x 1.5',
      height: '65mm'
    },
    images: [
      'https://www.pgfilters.com/wp-content/uploads/2023/02/AdobeStock_485635853.jpeg'
    ],
    stock: {
      quantity: 50,
      lowStockThreshold: 10,
      inStock: true
    },
    tags: ['filter', 'engine', 'oil'],
    isActive: true
  },
  {
    name: 'Brake Pad Set - Front',
    description: 'High-quality ceramic brake pads for superior stopping power and reduced brake dust.',
    price: 2500,
    discountPrice: 2200,
    brand: 'Bosch',
    partNumber: 'BP-001-F',
    subcategory: 'Brake System',
    compatibility: [
      { make: 'Maruti Suzuki', model: 'Swift', year: 2018 },
      { make: 'Honda', model: 'City', year: 2019 }
    ],
    specifications: {
      material: 'Ceramic',
      thickness: '12mm',
      position: 'Front'
    },
    images: [
      'https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png'
    ],
    stock: {
      quantity: 25,
      lowStockThreshold: 5,
      inStock: true
    },
    tags: ['brake', 'pads', 'safety'],
    isActive: true
  },
  {
    name: 'Brake Pad Set - Rear',
    description: 'Premium ceramic brake pads for rear wheels with excellent heat dissipation.',
    price: 2200,
    discountPrice: 1950,
    brand: 'Bosch',
    partNumber: 'BP-001-R',
    subcategory: 'Brake System',
    compatibility: [
      { make: 'Hyundai', model: 'Creta', year: 2020 },
      { make: 'Kia', model: 'Seltos', year: 2021 }
    ],
    specifications: {
      material: 'Ceramic',
      thickness: '10mm',
      position: 'Rear'
    },
    images: [
      'https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png'
    ],
    stock: {
      quantity: 20,
      lowStockThreshold: 4,
      inStock: true
    },
    tags: ['brake', 'pads', 'rear'],
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