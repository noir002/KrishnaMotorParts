const Cart = require('../src/models/Cart');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('Cart Model Extensions - Abandoned Cart Notification', () => {
  let testUser;
  let testCart;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '9876543210'
    });

    // Create a test cart
    testCart = await Cart.create({
      userId: testUser._id,
      items: []
    });
  });

  describe('Task 1.1 - Cart abandonment tracking fields', () => {
    it('should have abandonmentTracking object with all required fields', () => {
      expect(testCart.abandonmentTracking).toBeDefined();
      expect(testCart.abandonmentTracking.isAbandoned).toBe(false);
      expect(testCart.abandonmentTracking.abandonedAt).toBeUndefined();
      expect(testCart.abandonmentTracking.notificationsSent).toBe(0);
      expect(testCart.abandonmentTracking.lastNotificationSent).toBeUndefined();
      expect(testCart.abandonmentTracking.notificationTimestamps).toEqual([]);
      expect(testCart.abandonmentTracking.convertedAfterNotification).toBe(false);
      expect(testCart.abandonmentTracking.conversionTimestamp).toBeUndefined();
    });

    it('should have lastModifiedAt field with default value', () => {
      expect(testCart.lastModifiedAt).toBeDefined();
      expect(testCart.lastModifiedAt).toBeInstanceOf(Date);
    });

    it('should have compound index for abandoned cart queries', async () => {
      const indexes = Cart.schema.indexes();
      const compoundIndex = indexes.find(idx => 
        idx[0]['abandonmentTracking.isAbandoned'] === 1 &&
        idx[0]['abandonmentTracking.notificationsSent'] === 1 &&
        idx[0]['lastModifiedAt'] === -1
      );
      expect(compoundIndex).toBeDefined();
    });
  });

  describe('Task 1.2 - User notification preferences', () => {
    it('should have notificationPreferences object with abandonedCartEmails field', () => {
      expect(testUser.notificationPreferences).toBeDefined();
      expect(testUser.notificationPreferences.abandonedCartEmails).toBe(true);
    });

    it('should have optOutDate field', () => {
      expect(testUser.notificationPreferences.optOutDate).toBeUndefined();
    });

    it('should allow updating notification preferences', async () => {
      testUser.notificationPreferences.abandonedCartEmails = false;
      testUser.notificationPreferences.optOutDate = new Date();
      await testUser.save();

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.notificationPreferences.abandonedCartEmails).toBe(false);
      expect(updatedUser.notificationPreferences.optOutDate).toBeInstanceOf(Date);
    });
  });

  describe('Task 2.1 - markAsAbandoned method', () => {
    it('should mark cart as abandoned and set timestamp', async () => {
      const beforeTime = new Date();
      await testCart.markAsAbandoned();
      const afterTime = new Date();

      expect(testCart.abandonmentTracking.isAbandoned).toBe(true);
      expect(testCart.abandonmentTracking.abandonedAt).toBeInstanceOf(Date);
      expect(testCart.abandonmentTracking.abandonedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(testCart.abandonmentTracking.abandonedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should persist abandonment status to database', async () => {
      await testCart.markAsAbandoned();
      const reloadedCart = await Cart.findById(testCart._id);
      
      expect(reloadedCart.abandonmentTracking.isAbandoned).toBe(true);
      expect(reloadedCart.abandonmentTracking.abandonedAt).toBeInstanceOf(Date);
    });
  });

  describe('Task 2.2 - recordNotificationSent method', () => {
    it('should increment notification count and update timestamps', async () => {
      const beforeTime = new Date();
      await testCart.recordNotificationSent();
      const afterTime = new Date();

      expect(testCart.abandonmentTracking.notificationsSent).toBe(1);
      expect(testCart.abandonmentTracking.lastNotificationSent).toBeInstanceOf(Date);
      expect(testCart.abandonmentTracking.lastNotificationSent.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(testCart.abandonmentTracking.lastNotificationSent.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(testCart.abandonmentTracking.notificationTimestamps).toHaveLength(1);
    });

    it('should track multiple notifications', async () => {
      await testCart.recordNotificationSent();
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await testCart.recordNotificationSent();
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await testCart.recordNotificationSent();

      expect(testCart.abandonmentTracking.notificationsSent).toBe(3);
      expect(testCart.abandonmentTracking.notificationTimestamps).toHaveLength(3);
      
      // Verify timestamps are in order
      const timestamps = testCart.abandonmentTracking.notificationTimestamps;
      expect(timestamps[1].getTime()).toBeGreaterThanOrEqual(timestamps[0].getTime());
      expect(timestamps[2].getTime()).toBeGreaterThanOrEqual(timestamps[1].getTime());
    });
  });

  describe('Task 2.3 - recordConversion method', () => {
    it('should record conversion with reminder number', async () => {
      await testCart.recordNotificationSent();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      
      const beforeTime = new Date();
      await testCart.recordConversion(1);
      const afterTime = new Date();

      expect(testCart.abandonmentTracking.convertedAfterNotification).toBe(true);
      expect(testCart.abandonmentTracking.conversionReminderNumber).toBe(1);
      expect(testCart.abandonmentTracking.conversionTimestamp).toBeInstanceOf(Date);
      expect(testCart.abandonmentTracking.conversionTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(testCart.abandonmentTracking.conversionTimestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should calculate time elapsed since last notification', async () => {
      await testCart.recordNotificationSent();
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await testCart.recordConversion(1);

      expect(testCart.abandonmentTracking.timeToConversion).toBeDefined();
      expect(testCart.abandonmentTracking.timeToConversion).toBeGreaterThanOrEqual(100);
    });

    it('should persist conversion data to database', async () => {
      await testCart.recordNotificationSent();
      await testCart.recordConversion(2);
      
      const reloadedCart = await Cart.findById(testCart._id);
      expect(reloadedCart.abandonmentTracking.convertedAfterNotification).toBe(true);
      expect(reloadedCart.abandonmentTracking.conversionReminderNumber).toBe(2);
      expect(reloadedCart.abandonmentTracking.conversionTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('Integration - Complete abandonment flow', () => {
    it('should support complete abandonment and conversion flow', async () => {
      // Mark as abandoned
      await testCart.markAsAbandoned();
      expect(testCart.abandonmentTracking.isAbandoned).toBe(true);

      // Send first notification
      await testCart.recordNotificationSent();
      expect(testCart.abandonmentTracking.notificationsSent).toBe(1);

      // Send second notification
      await new Promise(resolve => setTimeout(resolve, 10));
      await testCart.recordNotificationSent();
      expect(testCart.abandonmentTracking.notificationsSent).toBe(2);

      // Record conversion
      await testCart.recordConversion(2);
      expect(testCart.abandonmentTracking.convertedAfterNotification).toBe(true);
      expect(testCart.abandonmentTracking.conversionReminderNumber).toBe(2);

      // Verify all data persisted
      const finalCart = await Cart.findById(testCart._id);
      expect(finalCart.abandonmentTracking.isAbandoned).toBe(true);
      expect(finalCart.abandonmentTracking.notificationsSent).toBe(2);
      expect(finalCart.abandonmentTracking.convertedAfterNotification).toBe(true);
      expect(finalCart.abandonmentTracking.conversionReminderNumber).toBe(2);
    });
  });
});
