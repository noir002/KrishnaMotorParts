
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

const fixLEDBulbImage = async () => {
  try {
    console.log('🔧 Fixing LED Headlight Bulb image...');

    // Update LED Headlight Bulb H4 with working image
    const result = await Product.updateOne(
      { name: 'LED Headlight Bulb H4' },
      { 
        $set: { 
          images: ['https://i.ebayimg.com/images/g/XK4AAOSwKmRj0yhu/s-l1600.webp']
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ LED Headlight Bulb image updated successfully!');
    } else {
      console.log('⚠️ No LED Headlight Bulb found to update');
    }

    // Verify the update
    const updatedProduct = await Product.findOne({ name: 'LED Headlight Bulb H4' });
    if (updatedProduct) {
      console.log('🔍 Verified image URL:', updatedProduct.images[0]);
    }

  } catch (error) {
    console.error('❌ Error fixing LED bulb image:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixLEDBulbImage();