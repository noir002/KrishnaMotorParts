const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder, validateOrderStatus, validateOrderCancel } = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', validateOrder, createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', getOrder);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', validateOrderCancel, cancelOrder);

// Admin routes
router.use(authorize('admin'));

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/admin/all', getAllOrders);

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (Admin only)
// @access  Private/Admin
router.get('/admin/stats', getOrderStats);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', validateOrderStatus, updateOrderStatus);

module.exports = router;