const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addAdminUser = async () => {
  try {
    console.log('🔧 Adding admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'krishnamotorparts1993@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        firstName: 'Krishna',
        lastName: 'Motor Parts',
        email: 'krishnamotorparts1993@gmail.com',
        password: 'admin123',
        phone: '8630373030',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Created new admin user');
    }

    console.log('🎉 Admin user setup completed!');
    console.log('📧 Email: krishnamotorparts1993@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error adding admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

addAdminUser();