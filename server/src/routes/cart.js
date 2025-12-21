const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { validateCartItem, validateCartUpdate } = require('../middleware/validation');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', getCart);

// @route   GET /api/cart/summary
// @desc    Get cart summary (item count and total)
// @access  Private
router.get('/summary', getCartSummary);

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', validateCartItem, addToCart);

// @route   PUT /api/cart/items/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/items/:productId', validateCartUpdate, updateCartItem);

// @route   DELETE /api/cart/items/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:productId', removeFromCart);

// @route   POST /api/cart/validate
// @desc    Validate cart items against current stock
// @access  Private
router.post('/validate', validateCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', clearCart);

module.exports = router;