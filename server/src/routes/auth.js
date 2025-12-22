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
const rateLimitMiddleware = process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next();

// Debug middleware to log all requests
const debugMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  next();
};

// Public routes with rate limiting
router.post('/register', rateLimitMiddleware, debugMiddleware, register);
router.post('/login', rateLimitMiddleware, debugMiddleware, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressIndex', protect, updateAddress);
router.delete('/addresses/:addressIndex', protect, deleteAddress);

module.exports = router;