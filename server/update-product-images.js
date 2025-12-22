// Script to update product images in production database
const mongoose = require('mongoose');

// Use your production MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://paraschauhan:Paras%401234@krishnamotorparts.6qljhwh.mongodb.net/automobile_ecommerce?retryWrites=true&w=majority&appName=KrishnaMotorParts';

// Import models
const Product = require('./src/models/Product');

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateProductImages = async () => {
  try {
    console.log('🖼️ Starting product image updates...');

    // Update Timing Belt Kit
    await Product.updateOne(
      { name: 'Timing Belt Kit' },
      { 
        $set: { 
          images: ['https://5.imimg.com/data5/KI/IT/CI/SELLER-786246/timing-belt-1000x1000.jpg']
        }
      }
    );
    console.log('✅ Updated Timing Belt Kit image');

    // Update Radiator Coolant
    await Product.updateOne(
      { name: 'Radiator Coolant' },
      { 
        $set: { 
          images: ['https://cdn11.bigcommerce.com/s-eqgv9kc7pj/images/stencil/1280x1280/products/5607/9836/Prime_Antifreeze-6__17207.1756384741.png?c=2']
        }
      }
    );
    console.log('✅ Updated Radiator Coolant image');

    // Update Oil Filter
    await Product.updateOne(
      { name: 'Oil Filter' },
      { 
        $set: { 
          images: ['https://www.pgfilters.com/wp-content/uploads/2023/02/AdobeStock_485635853.jpeg']
        }
      }
    );
    console.log('✅ Updated Oil Filter image');

    // Update Brake Pad Set - Front
    await Product.updateOne(
      { name: 'Brake Pad Set - Front' },
      { 
        $set: { 
          images: ['https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png']
        }
      }
    );
    console.log('✅ Updated Front Brake Pad image');

    // Update Brake Pad Set - Rear
    await Product.updateOne(
      { name: 'Brake Pad Set - Rear' },
      { 
        $set: { 
          images: ['https://api.brakeup.in/media/product/3db376ed-82b7-44ef-ab__1.png']
        }
      }
    );
    console.log('✅ Updated Rear Brake Pad image');

    // Update Windshield Wiper Blades
    await Product.updateOne(
      { name: 'Windshield Wiper Blades' },
      { 
        $set: { 
          images: ['https://i.ebayimg.com/images/g/eLAAAOSwOHlk8f6K/s-l1600.webp']
        }
      }
    );
    console.log('✅ Updated Windshield Wiper Blades image');

    // Update Engine Oil 5W-30
    await Product.updateOne(
      { name: 'Engine Oil 5W-30' },
      { 
        $set: { 
          images: ['https://www.shutterstock.com/shutterstock/photos/2488384121/display_1500/stock-photo-kedah-malaysia-july-a-bottles-castrol-magnatec-fully-synthetic-w-engine-oil-close-2488384121.jpg']
        }
      }
    );
    console.log('✅ Updated Engine Oil 5W-30 image');

    console.log('🎉 All product images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating product images:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateProductImages();