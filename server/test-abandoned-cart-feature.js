/**
 * Test script to verify abandoned cart notification feature
 * This script creates test data and triggers the notification process
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Cart = require('./src/models/Cart');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const AbandonedCartScheduler = require('./src/services/abandonedCartScheduler');
const notificationService = require('./src/services/notificationService');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/automobile_ecommerce')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

async function testAbandonedCartFeature() {
  console.log('\n=== Testing Abandoned Cart Notification Feature ===\n');

  try {
    // Step 1: Create or find test user
    console.log('Step 1: Creating test user...');
    let testUser = await User.findOne({ email: 'testbuyer@example.com' });
    
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'Buyer',
        email: 'testbuyer@example.com',
        password: 'testpassword123',
        phone: '9876543210',
        role: 'customer',
        notificationPreferences: {
          abandonedCartEmails: true // Opted in for notifications
        }
      });
      console.log('✓ Test user created:', testUser.email);
    } else {
      console.log('✓ Test user found:', testUser.email);
      // Ensure user is opted in
      if (!testUser.notificationPreferences) {
        testUser.notificationPreferences = { abandonedCartEmails: true };
        await testUser.save();
      }
    }

    // Step 2: Find or create test product
    console.log('\nStep 2: Finding test product...');
    let testProduct = await Product.findOne({ isActive: true });
    
    if (!testProduct) {
      console.log('✗ No active products found. Please add products first.');
      process.exit(1);
    }
    console.log('✓ Test product found:', testProduct.name);

    // Step 3: Create abandoned cart
    console.log('\nStep 3: Creating abandoned cart...');
    
    // Delete existing cart for this user
    await Cart.deleteOne({ userId: testUser._id });
    
    const testCart = new Cart({
      userId: testUser._id,
      items: [{
        productId: testProduct._id,
        quantity: 2
      }]
    });
    await testCart.save();
    
    // Set lastModifiedAt to 2 hours ago (so it's eligible for first reminder)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    testCart.lastModifiedAt = twoHoursAgo;
    await testCart.save();
    
    console.log('✓ Abandoned cart created');
    console.log('  Cart ID:', testCart._id);
    console.log('  User:', testUser.email);
    console.log('  Items:', testCart.items.length);
    console.log('  Last Modified:', testCart.lastModifiedAt);

    // Step 4: Check if cart is eligible
    console.log('\nStep 4: Checking cart eligibility...');
    const eligibleCarts = await AbandonedCartScheduler.findEligibleCarts();
    const isEligible = eligibleCarts.some(cart => cart._id.toString() === testCart._id.toString());
    
    if (isEligible) {
      console.log('✓ Cart is eligible for notification');
      console.log('  Total eligible carts:', eligibleCarts.length);
    } else {
      console.log('✗ Cart is NOT eligible. Checking why...');
      console.log('  Has items:', testCart.items.length > 0);
      console.log('  Not converted:', !testCart.abandonmentTracking.convertedAfterNotification);
      console.log('  Notifications sent:', testCart.abandonmentTracking.notificationsSent);
      console.log('  Last modified:', testCart.lastModifiedAt);
      console.log('  User opted in:', testUser.notificationPreferences?.abandonedCartEmails !== false);
    }

    // Step 5: Manually trigger notification
    console.log('\nStep 5: Manually triggering notification...');
    const scheduler = new AbandonedCartScheduler(notificationService);
    
    // Determine reminder number
    const reminderNumber = scheduler.determineReminderNumber(testCart.toObject());
    console.log('  Reminder number:', reminderNumber);
    
    if (reminderNumber) {
      // Fetch fresh cart (not lean)
      const freshCart = await Cart.findById(testCart._id);
      
      // Send notification
      console.log('  Sending notification...');
      const result = await notificationService.sendAbandonedCartReminder(
        freshCart,
        testUser,
        reminderNumber
      );
      
      if (result.success) {
        console.log('✓ Notification sent successfully!');
        
        // Record notification
        await freshCart.recordNotificationSent();
        console.log('✓ Notification recorded in database');
        
        // Show updated cart status
        const updatedCart = await Cart.findById(testCart._id);
        console.log('\n  Updated Cart Status:');
        console.log('    Notifications sent:', updatedCart.abandonmentTracking.notificationsSent);
        console.log('    Last notification:', updatedCart.abandonmentTracking.lastNotificationSent);
        console.log('    Is abandoned:', updatedCart.abandonmentTracking.isAbandoned);
      } else {
        console.log('✗ Notification failed:', result.error);
      }
    } else {
      console.log('✗ Cart not eligible for reminder at this time');
    }

    // Step 6: Check email configuration
    console.log('\nStep 6: Email Configuration Status:');
    console.log('  Email Service:', process.env.EMAIL_SERVICE || 'Not configured');
    console.log('  Email Username:', process.env.EMAIL_USERNAME || 'Not configured');
    console.log('  Email Password:', process.env.EMAIL_PASSWORD ? '***configured***' : 'Not configured');
    
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.log('\n⚠️  WARNING: Email service not fully configured!');
      console.log('   Emails will be logged but not actually sent.');
      console.log('   To send real emails, configure EMAIL_SERVICE, EMAIL_USERNAME, and EMAIL_PASSWORD in .env');
    } else {
      console.log('\n✓ Email service is configured. Check the buyer\'s email inbox!');
      console.log('  Buyer email:', testUser.email);
    }

    // Step 7: Show what buyer will receive
    console.log('\n=== What the Buyer Will Receive ===\n');
    console.log('📧 Email Subject: "You left items in your cart - Krishna Motor Parts"');
    console.log('\n📝 Email Content:');
    console.log('   - Greeting with buyer\'s name');
    console.log('   - Message about abandoned cart');
    console.log('   - List of cart items with images, quantities, and prices');
    console.log('   - Total cart value');
    console.log('   - "Complete Your Purchase" button linking to checkout');
    console.log('   - Unsubscribe link');
    console.log('\n📅 Reminder Schedule:');
    console.log('   - 1st reminder: 1 hour after cart abandonment');
    console.log('   - 2nd reminder: 24 hours after 1st reminder');
    console.log('   - 3rd reminder: 3 days after 2nd reminder');

    console.log('\n=== Test Complete ===\n');
    console.log('Next Steps:');
    console.log('1. Check backend logs for [AbandonedCartScheduler] messages');
    console.log('2. Check buyer email inbox:', testUser.email);
    console.log('3. Wait for scheduler to run (every 15 minutes) or restart server');
    console.log('4. Monitor MongoDB for cart updates');
    console.log('\nTo clean up test data, run:');
    console.log('  mongosh automobile_ecommerce --eval "db.carts.deleteOne({userId: ObjectId(\'' + testUser._id + '\')})"');
    
  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run test after connection
mongoose.connection.once('open', () => {
  testAbandonedCartFeature();
});
