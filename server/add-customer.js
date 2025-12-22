const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addCustomer = async () => {
  try {
    console.log('🔧 Adding customer account...');

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email: 'chauhanparas7500@gmail.com' });
    
    if (existingCustomer) {
      console.log('✅ Customer account already exists');
      
      // Update password if needed
      existingCustomer.password = 'Paras@1234';
      existingCustomer.phone = '9389333504';
      existingCustomer.firstName = 'Paras';
      existingCustomer.lastName = 'Chauhan';
      await existingCustomer.save();
      console.log('✅ Updated existing customer account');
    } else {
      // Create new customer
      const customer = new User({
        firstName: 'Paras',
        lastName: 'Chauhan',
        email: 'chauhanparas7500@gmail.com',
        password: 'Paras@1234',
        phone: '9389333504',
        role: 'customer'
      });

      await customer.save();
      console.log('✅ Created new customer account');
    }

    console.log('🎉 Customer account setup completed!');
    console.log('📧 Email: chauhanparas7500@gmail.com');
    console.log('🔑 Password: Paras@1234');
    console.log('📱 Phone: 9389333504');
    console.log('👤 Name: Paras Chauhan');
    console.log('👤 Role: customer');

  } catch (error) {
    console.error('❌ Error adding customer:', error);
  } finally {
    mongoose.connection.close();
  }
};

addCustomer();
