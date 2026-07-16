const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getInventoryReport,
  getLowStockProducts,
  updateProductStock,
  bulkUpdateProducts,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderAnalytics,
  getSalesReport,
  getCustomerAnalytics,
  exportOrdersData,
  exportProductsData
} = require('../controllers/adminController');

const {
  getAbandonedCartStats,
  getAbandonedCarts,
  getConversionMetrics
} = require('../controllers/adminAbandonedCartController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard and Analytics Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/sales', getSalesReport);
router.get('/analytics/customers', getCustomerAnalytics);

// Inventory Management Routes
router.get('/inventory/report', getInventoryReport);
router.get('/inventory/low-stock', getLowStockProducts);
router.put('/inventory/stock/:productId', updateProductStock);
router.put('/inventory/bulk-update', bulkUpdateProducts);

// Order Management Routes
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId/status', updateOrderStatus);

// Data Export Routes
router.get('/export/orders', exportOrdersData);
router.get('/export/products', exportProductsData);

// Abandoned Cart Analytics Routes
router.get('/abandoned-carts/stats', getAbandonedCartStats);
router.get('/abandoned-carts', getAbandonedCarts);
router.get('/abandoned-carts/conversions', getConversionMetrics);

module.exports = router;