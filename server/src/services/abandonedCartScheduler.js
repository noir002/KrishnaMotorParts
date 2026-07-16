const cron = require('node-cron');
const Cart = require('../models/Cart');
const User = require('../models/User');
const notificationService = require('./notificationService');

class AbandonedCartScheduler {
  constructor(notificationServiceInstance = notificationService) {
    this.notificationService = notificationServiceInstance;
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start the scheduler with a 15-minute cron schedule
   * Cron pattern: every 15 minutes
   */
  start() {
    if (this.isRunning) {
      console.log('[AbandonedCartScheduler] Scheduler is already running');
      return;
    }

    // Don't start scheduler in test environment unless explicitly enabled
    if (process.env.NODE_ENV === 'test' && !process.env.ENABLE_SCHEDULER_IN_TEST) {
      console.log('[AbandonedCartScheduler] Scheduler disabled in test environment');
      return;
    }

    console.log('[AbandonedCartScheduler] Starting scheduler (runs every 15 minutes)');
    
    // Schedule to run every 15 minutes
    this.cronJob = cron.schedule('*/15 * * * *', async () => {
      await this.processAbandonedCarts();
    });

    this.isRunning = true;
    console.log('[AbandonedCartScheduler] Scheduler started successfully at', new Date().toISOString());
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('[AbandonedCartScheduler] Scheduler stopped at', new Date().toISOString());
  }

  /**
   * Find carts eligible for abandoned cart notifications
   * Requirements: 1.3, 1.4, 2.5, 4.2, 8.1
   * 
   * @returns {Promise<Array>} Array of eligible carts with populated user data
   */
  static async findEligibleCarts() {
    try {
      const now = new Date();
      // Changed from 1 hour to 2 minutes for testing
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

      console.log(`[AbandonedCartScheduler] Querying eligible carts (lastModifiedAt < ${twoMinutesAgo.toISOString()})`);

      // Query carts that:
      // 1. Have items (not empty)
      // 2. Have not been converted to orders
      // 3. Have not reached maximum notification limit (3)
      // 4. Were last modified more than 1 hour ago
      const carts = await Cart.find({
        'items.0': { $exists: true }, // Has at least one item
        'abandonmentTracking.convertedAfterNotification': { $ne: true }, // Not converted
        'abandonmentTracking.notificationsSent': { $lt: 3 }, // Less than 3 notifications sent
        lastModifiedAt: { $lt: twoMinutesAgo } // Last modified more than 2 minutes ago
      })
      .populate({
        path: 'userId',
        select: 'email firstName lastName notificationPreferences'
      })
      .lean();

      console.log(`[AbandonedCartScheduler] Found ${carts.length} carts matching query criteria`);

      // Filter by user opt-in status (requirement 4.2)
      const eligibleCarts = carts.filter(cart => {
        // Exclude if user doesn't exist
        if (!cart.userId) {
          console.log(`[AbandonedCartScheduler] Excluding cart ${cart._id}: user not found`);
          return false;
        }
        
        // Exclude if user has opted out of abandoned cart emails
        if (cart.userId.notificationPreferences && 
            cart.userId.notificationPreferences.abandonedCartEmails === false) {
          console.log(`[AbandonedCartScheduler] Excluding cart ${cart._id}: user ${cart.userId.email} opted out`);
          return false;
        }
        
        return true;
      });

      console.log(`[AbandonedCartScheduler] ${eligibleCarts.length} carts eligible after filtering`);

      return eligibleCarts;
    } catch (error) {
      console.error('[AbandonedCartScheduler] Database error finding eligible carts:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Determine which reminder number to send based on time elapsed
   * Requirements: 2.2, 2.3, 2.4
   * NOTE: Timing adjusted for testing - 2 min, 5 min, 10 min instead of 1hr, 24hr, 3days
   * 
   * @param {Object} cart - The cart object
   * @returns {number|null} Reminder number (1, 2, or 3) or null if not eligible
   */
  determineReminderNumber(cart) {
    const now = new Date();
    const notificationsSent = cart.abandonmentTracking.notificationsSent || 0;
    
    // If already sent 3 notifications, no more reminders
    if (notificationsSent >= 3) {
      return null;
    }

    // Calculate time elapsed since last modification or last notification
    let referenceTime;
    if (notificationsSent === 0) {
      // First reminder: check time since last modification
      referenceTime = new Date(cart.lastModifiedAt);
    } else {
      // Subsequent reminders: check time since last notification
      referenceTime = new Date(cart.abandonmentTracking.lastNotificationSent);
    }

    const timeElapsed = now - referenceTime;
    const minutesElapsed = timeElapsed / (1000 * 60);

    // Reminder timing logic (TESTING MODE):
    // - First reminder: 2 minutes after abandonment
    // - Second reminder: 5 minutes after first reminder
    // - Third reminder: 10 minutes after second reminder
    
    if (notificationsSent === 0 && minutesElapsed >= 2) {
      return 1;
    } else if (notificationsSent === 1 && minutesElapsed >= 5) {
      return 2;
    } else if (notificationsSent === 2 && minutesElapsed >= 10) {
      return 3;
    }

    return null;
  }

  /**
   * Main processing loop for abandoned carts
   * Requirements: 8.2, 8.4
   * 
   * Processes carts in batches and sends notifications
   */
  async processAbandonedCarts() {
    const startTime = new Date();
    console.log(`[AbandonedCartScheduler] [${startTime.toISOString()}] Starting abandoned cart processing...`);

    try {
      // Find all eligible carts
      const eligibleCarts = await AbandonedCartScheduler.findEligibleCarts();
      
      if (eligibleCarts.length === 0) {
        console.log('[AbandonedCartScheduler] No eligible abandoned carts found');
        return;
      }

      console.log(`[AbandonedCartScheduler] Found ${eligibleCarts.length} eligible abandoned carts`);

      let successCount = 0;
      let failureCount = 0;
      let skippedCount = 0;
      const failedCarts = [];

      // Process carts in batches of 50 (requirement 8.4)
      const batchSize = 50;
      for (let i = 0; i < eligibleCarts.length; i += batchSize) {
        const batch = eligibleCarts.slice(i, i + batchSize);
        console.log(`[AbandonedCartScheduler] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} carts)`);
        
        // Process each cart in the batch
        for (const cartData of batch) {
          try {
            // Determine which reminder to send
            const reminderNumber = this.determineReminderNumber(cartData);
            
            if (reminderNumber === null) {
              skippedCount++;
              continue;
            }

            // Fetch the cart document (not lean) for atomic updates
            let cart;
            try {
              cart = await Cart.findById(cartData._id);
            } catch (dbError) {
              console.error(`[AbandonedCartScheduler] Database error fetching cart ${cartData._id}:`, {
                cartId: cartData._id,
                error: dbError.message,
                stack: dbError.stack
              });
              failureCount++;
              failedCarts.push({
                cartId: cartData._id,
                userId: cartData.userId ? cartData.userId._id : 'unknown',
                userEmail: cartData.userId ? cartData.userId.email : 'unknown',
                error: `Database error: ${dbError.message}`
              });
              continue;
            }
            
            if (!cart) {
              console.warn(`[AbandonedCartScheduler] Cart ${cartData._id} not found, skipping`);
              skippedCount++;
              continue;
            }

            // Double-check notification count to prevent race conditions (requirement 8.2)
            if (cart.abandonmentTracking.notificationsSent >= 3) {
              skippedCount++;
              continue;
            }

            // Mark as abandoned if not already marked
            if (!cart.abandonmentTracking.isAbandoned) {
              try {
                cart.abandonmentTracking.isAbandoned = true;
                cart.abandonmentTracking.abandonedAt = new Date();
              } catch (error) {
                console.error(`[AbandonedCartScheduler] Error marking cart ${cart._id} as abandoned:`, {
                  cartId: cart._id,
                  error: error.message
                });
              }
            }

            // Send notification
            const user = cartData.userId;
            const result = await this.notificationService.sendAbandonedCartReminder(cart, user, reminderNumber);

            if (result.success) {
              // Record notification sent using atomic update (requirement 8.2)
              try {
                await cart.recordNotificationSent();
                successCount++;
                console.log(`[AbandonedCartScheduler] ✓ Sent reminder ${reminderNumber} to user ${user.email} for cart ${cart._id}`);
              } catch (dbError) {
                console.error(`[AbandonedCartScheduler] Database error recording notification for cart ${cart._id}:`, {
                  cartId: cart._id,
                  userId: user._id,
                  error: dbError.message,
                  stack: dbError.stack
                });
                // Email was sent but we couldn't record it - log as failure
                failureCount++;
                failedCarts.push({
                  cartId: cart._id,
                  userId: user._id,
                  userEmail: user.email,
                  reminderNumber,
                  error: `Email sent but failed to record: ${dbError.message}`
                });
              }
            } else {
              // Email send failed after retries
              failureCount++;
              failedCarts.push({
                cartId: cart._id,
                userId: user._id,
                userEmail: user.email,
                reminderNumber,
                error: result.error
              });
              console.error(`[AbandonedCartScheduler] ✗ Failed to send reminder to user ${user.email} for cart ${cart._id}: ${result.error}`);
            }
          } catch (error) {
            failureCount++;
            const user = cartData.userId;
            failedCarts.push({
              cartId: cartData._id,
              userId: user ? user._id : 'unknown',
              userEmail: user ? user.email : 'unknown',
              error: error.message
            });
            console.error(`[AbandonedCartScheduler] ✗ Error processing cart ${cartData._id}:`, {
              cartId: cartData._id,
              userId: user ? user._id : 'unknown',
              userEmail: user ? user.email : 'unknown',
              error: error.message,
              stack: error.stack
            });
            // Continue processing other carts even if one fails (requirement 7.3)
          }
        }
      }

      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`[AbandonedCartScheduler] [${endTime.toISOString()}] Abandoned cart processing completed`);
      console.log(`[AbandonedCartScheduler] Processing summary:`, {
        duration: `${duration}s`,
        totalProcessed: eligibleCarts.length,
        successful: successCount,
        failed: failureCount,
        skipped: skippedCount
      });

      // Log detailed failure information if any failures occurred
      if (failedCarts.length > 0) {
        console.error(`[AbandonedCartScheduler] Failed cart details:`, JSON.stringify(failedCarts, null, 2));
      }
    } catch (error) {
      // Database or system-level error
      console.error('[AbandonedCartScheduler] Critical error in abandoned cart processing:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Log error and continue - next scheduled run will retry (requirement 7.4)
    }
  }
}

module.exports = AbandonedCartScheduler;
