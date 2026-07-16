# Implementation Plan: Abandoned Cart Notification

## Overview

This implementation plan breaks down the Abandoned Cart Notification feature into incremental coding tasks. The approach follows this sequence: extend data models → implement core tracking logic → build scheduler → extend notification service → add API endpoints → implement admin dashboard. Each step builds on previous work and includes property-based tests to validate correctness early.

## Tasks

- [x] 1. Extend data models with abandonment tracking fields
  - [x] 1.1 Add abandonment tracking fields to Cart model
    - Add `abandonmentTracking` object with fields: isAbandoned, abandonedAt, notificationsSent, lastNotificationSent, notificationTimestamps, convertedAfterNotification, conversionTimestamp, conversionReminderNumber
    - Add `lastModifiedAt` field with default Date.now
    - Add compound index for efficient abandoned cart queries
    - _Requirements: 1.1, 1.5, 8.1_
  
  - [x] 1.2 Add notification preferences to User model
    - Add `notificationPreferences` object with `abandonedCartEmails` boolean field (default true)
    - Add `optOutDate` field to track when user opted out
    - _Requirements: 4.1, 4.5_
  
  - [ ]* 1.3 Write property test for cart timestamp updates
    - **Property 1: Cart modification updates timestamp**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 1.4 Write property test for abandonment data persistence
    - **Property 4: Abandonment data persistence**
    - **Validates: Requirements 1.5**

- [x] 2. Implement cart tracking methods
  - [x] 2.1 Add instance method to mark cart as abandoned
    - Implement `markAsAbandoned()` method on Cart model
    - Set isAbandoned to true and record abandonedAt timestamp
    - _Requirements: 1.4, 1.5_
  
  - [x] 2.2 Add instance method to record notification sent
    - Implement `recordNotificationSent()` method on Cart model
    - Increment notificationsSent count
    - Update lastNotificationSent timestamp
    - Push timestamp to notificationTimestamps array
    - _Requirements: 2.6_
  
  - [x] 2.3 Add instance method to record conversion
    - Implement `recordConversion(reminderNumber)` method on Cart model
    - Set convertedAfterNotification to true
    - Store conversionReminderNumber and conversionTimestamp
    - Calculate time elapsed since last notification
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 2.4 Write property test for abandonment detection
    - **Property 3: Abandonment detection identifies eligible carts**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.5 Write property test for notification tracking
    - **Property 7: Notification tracking persistence**
    - **Validates: Requirements 2.6**
  
  - [ ]* 2.6 Write property test for conversion attribution
    - **Property 13: Conversion attribution recording**
    - **Validates: Requirements 5.1, 5.2**

- [x] 3. Checkpoint - Ensure model extensions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement abandoned cart scheduler service
  - [x] 4.1 Create AbandonedCartScheduler class
    - Create `server/src/services/abandonedCartScheduler.js`
    - Install node-cron dependency
    - Implement constructor and start() method with 15-minute cron schedule
    - _Requirements: 2.1_
  
  - [x] 4.2 Implement cart eligibility query logic
    - Implement `findEligibleCarts()` static method
    - Query carts with items, not converted, within notification limits
    - Filter by user opt-in status
    - Use indexes for performance
    - _Requirements: 1.3, 1.4, 2.5, 4.2, 8.1_
  
  - [x] 4.3 Implement reminder timing logic
    - Implement `determineReminderNumber(cart)` method
    - Calculate time elapsed since abandonment
    - Return appropriate reminder number (1, 2, 3) or null if not eligible
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 4.4 Implement main processing loop
    - Implement `processAbandonedCarts()` method
    - Process carts in batches of 50
    - For each cart: determine reminder number, send notification, handle errors
    - Use atomic updates to prevent duplicate processing
    - _Requirements: 8.2, 8.4_
  
  - [ ]* 4.5 Write property test for reminder timing logic
    - **Property 5: Reminder timing logic**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [ ]* 4.6 Write property test for maximum notification limit
    - **Property 6: Maximum notification limit**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.7 Write property test for checkout exclusion
    - **Property 2: Checkout prevents abandonment notifications**
    - **Validates: Requirements 1.3**
  
  - [ ]* 4.8 Write property test for opted-out user exclusion
    - **Property 11: Opted-out users excluded from notifications**
    - **Validates: Requirements 4.2**

- [ ] 5. Extend notification service with abandoned cart emails
  - [x] 5.1 Add sendAbandonedCartReminder method
    - Extend NotificationService class with `sendAbandonedCartReminder(cart, user, reminderNumber)`
    - Validate user opt-in status
    - Populate cart with product details
    - Filter out invalid products
    - Skip if no valid products remain
    - Generate email HTML and send
    - _Requirements: 3.1, 4.2, 7.5, 7.6_
  
  - [x] 5.2 Implement email HTML generation
    - Implement `generateAbandonedCartHTML(cart, user, reminderNumber)` method
    - Include product details: name, image, quantity, price
    - Calculate and display total cart value
    - Include checkout link with cart ID
    - Include unsubscribe link with signed user token
    - Vary message content based on reminder number
    - Use mobile-responsive HTML template
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [x] 5.3 Implement retry logic for email failures
    - Wrap email sending in retry logic with exponential backoff
    - Maximum 3 attempts with delays: 1s, 2s, 4s
    - Log each attempt and final result
    - Mark notification as failed if all retries fail
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 5.4 Write property test for email content completeness
    - **Property 8: Email content completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [ ]* 5.5 Write property test for message variation
    - **Property 9: Reminder message variation**
    - **Validates: Requirements 3.6**
  
  - [ ]* 5.6 Write property test for invalid product filtering
    - **Property 21: Invalid product filtering**
    - **Validates: Requirements 7.5**
  
  - [ ]* 5.7 Write unit tests for email retry logic
    - Test retry attempts and exponential backoff
    - Test failure after max retries
    - Test success on retry
    - _Requirements: 7.2, 7.3_

- [x] 6. Checkpoint - Ensure notification service works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement opt-out management API
  - [x] 7.1 Create notification preferences controller
    - Create `server/src/controllers/notificationPreferencesController.js`
    - Implement `unsubscribeFromAbandonedCart(req, res)` handler
    - Implement `updateNotificationPreferences(req, res)` handler
    - Implement `getNotificationPreferences(req, res)` handler
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [x] 7.2 Create unsubscribe token utility
    - Create `server/src/utils/unsubscribeToken.js`
    - Implement `generateUnsubscribeToken(userId)` function using JWT
    - Implement `verifyUnsubscribeToken(token)` function
    - _Requirements: 4.1_
  
  - [x] 7.3 Add routes for notification preferences
    - Add GET `/api/notification-preferences` route (authenticated)
    - Add PUT `/api/notification-preferences` route (authenticated)
    - Add GET `/api/unsubscribe/abandoned-cart` route (token-based, no auth)
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ]* 7.4 Write property test for opt-out persistence
    - **Property 10: Opt-out updates user preferences**
    - **Validates: Requirements 4.1, 4.5**
  
  - [ ]* 7.5 Write property test for opt-in restoration
    - **Property 12: Opt-in restoration**
    - **Validates: Requirements 4.4**
  
  - [ ]* 7.6 Write unit tests for unsubscribe flow
    - Test valid token unsubscribe
    - Test invalid token rejection
    - Test confirmation page response
    - _Requirements: 4.1, 4.3_

- [x] 8. Implement conversion tracking in checkout flow
  - [x] 8.1 Update checkout controller to record conversions
    - Modify existing checkout completion logic
    - Check if cart has notifications sent
    - Call cart.recordConversion() with appropriate reminder number
    - Clear cart after successful checkout
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 8.2 Write property test for conversion time tracking
    - **Property 14: Conversion time tracking**
    - **Validates: Requirements 5.3**
  
  - [ ]* 8.3 Write unit tests for checkout conversion tracking
    - Test conversion with notifications sent
    - Test conversion without notifications
    - Test conversion data persistence
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Implement admin dashboard API endpoints
  - [x] 9.1 Create admin abandoned cart controller
    - Create `server/src/controllers/adminAbandonedCartController.js`
    - Implement `getAbandonedCartStats(req, res)` handler
    - Implement `getAbandonedCarts(req, res)` handler for paginated list
    - Implement `getConversionMetrics(req, res)` handler
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 9.2 Implement statistics aggregation queries
    - Create `server/src/services/abandonedCartAnalytics.js`
    - Implement `calculateAbandonmentRate(startDate, endDate)` function
    - Implement `calculateRecoveryRate(startDate, endDate)` function
    - Implement `calculateRevenueRecovered(startDate, endDate)` function
    - Implement `getConversionsByReminderNumber(startDate, endDate)` function
    - Implement `getAverageConversionTime(startDate, endDate)` function
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 9.3 Add admin routes for abandoned cart analytics
    - Add GET `/api/admin/abandoned-carts/stats` route (admin only)
    - Add GET `/api/admin/abandoned-carts` route (admin only)
    - Add GET `/api/admin/abandoned-carts/conversions` route (admin only)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 9.4 Write property test for abandoned cart count
    - **Property 15: Abandoned cart count accuracy**
    - **Validates: Requirements 6.1**
  
  - [ ]* 9.5 Write property test for abandonment rate calculation
    - **Property 16: Abandonment rate calculation**
    - **Validates: Requirements 6.2**
  
  - [ ]* 9.6 Write property test for recovery rate calculation
    - **Property 17: Recovery rate calculation**
    - **Validates: Requirements 6.3**
  
  - [ ]* 9.7 Write property test for revenue calculation
    - **Property 19: Revenue recovery calculation**
    - **Validates: Requirements 6.6**
  
  - [ ]* 9.8 Write property test for date range filtering
    - **Property 20: Date range filtering**
    - **Validates: Requirements 6.7**
  
  - [ ]* 9.9 Write property test for conversion metrics by reminder
    - **Property 18: Conversion metrics by reminder number**
    - **Validates: Requirements 6.5**

- [x] 10. Checkpoint - Ensure analytics and admin features work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Wire scheduler into application startup
  - [x] 11.1 Initialize scheduler in server.js
    - Import AbandonedCartScheduler
    - Initialize with NotificationService instance
    - Call start() method after database connection
    - Add graceful shutdown handling for scheduler
    - _Requirements: 2.1_
  
  - [x] 11.2 Add environment configuration
    - Add scheduler configuration to .env file
    - Add email template base URL for checkout links
    - Add JWT secret for unsubscribe tokens
    - _Requirements: 2.1, 3.3, 4.1_
  
  - [ ]* 11.3 Write integration tests for complete flow
    - Test cart creation → abandonment → notification → conversion flow
    - Test scheduler processing with mocked time
    - Test email delivery with mocked Nodemailer
    - _Requirements: 1.1, 2.2, 3.1, 5.1_

- [x] 12. Implement error handling and logging
  - [x] 12.1 Add error logging throughout scheduler
    - Log scheduler start/stop events
    - Log cart processing results (success/failure counts)
    - Log email send failures with cart and user details
    - Log database errors with context
    - _Requirements: 7.1, 7.4_
  
  - [x] 12.2 Add database error handling
    - Wrap scheduler database queries in try-catch
    - Wrap notification service database updates in try-catch
    - Log errors and continue processing
    - _Requirements: 7.4_
  
  - [ ]* 12.3 Write property test for error resilience
    - **Property 22: Concurrent processing deduplication**
    - **Validates: Requirements 8.2**
  
  - [ ]* 12.4 Write unit tests for error scenarios
    - Test email send failure with retries
    - Test database unavailable scenario
    - Test cart with only invalid products
    - Test scheduler continues after individual cart failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 13. Create admin dashboard frontend components (optional)
  - [ ] 13.1 Create AbandonedCartStats component
    - Display total abandoned carts, abandonment rate, recovery rate
    - Display average conversion time and revenue recovered
    - Add date range filter controls
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_
  
  - [ ] 13.2 Create AbandonedCartList component
    - Display paginated list of abandoned carts
    - Show cart details, user info, notification status
    - Add filters for notification count and date range
    - _Requirements: 6.1, 6.7_
  
  - [ ] 13.3 Create ConversionMetrics component
    - Display conversion rates by reminder number (1, 2, 3)
    - Show bar chart or visualization of conversion breakdown
    - _Requirements: 6.5_
  
  - [ ] 13.4 Add abandoned cart section to admin dashboard
    - Add navigation link to abandoned cart analytics
    - Create route for abandoned cart dashboard page
    - Wire up components with API calls
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 14. Final checkpoint - End-to-end validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The scheduler will not run in test environment unless explicitly enabled
- Use MongoDB transactions for conversion tracking to ensure data consistency
- Email templates should reuse existing NotificationService styling
- Admin dashboard frontend (task 13) is optional - API endpoints work standalone
- Consider adding monitoring/alerting for scheduler failures in production
- Test with realistic cart data including various product configurations
