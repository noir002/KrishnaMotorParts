const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting only in production
const rateLimitMiddleware = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : authLimiter;

// Public routes with rate limiting
router.post('/register', rateLimitMiddleware, register);
router.post('/login', rateLimitMiddleware, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressIndex', protect, updateAddress);
router.delete('/addresses/:addressIndex', protect, deleteAddress);

module.exports = router;