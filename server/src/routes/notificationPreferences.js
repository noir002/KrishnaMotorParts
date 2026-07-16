const express = require('express');
const {
  unsubscribeFromAbandonedCart,
  updateNotificationPreferences,
  getNotificationPreferences
} = require('../controllers/notificationPreferencesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route - token-based unsubscribe (no authentication required)
router.get('/unsubscribe/abandoned-cart', unsubscribeFromAbandonedCart);

// Protected routes - require authentication
router.route('/')
  .get(protect, getNotificationPreferences)
  .put(protect, updateNotificationPreferences);

module.exports = router;
