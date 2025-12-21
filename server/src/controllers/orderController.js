const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const cacheService = require('../services/cacheService');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.isEmpty) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: 'Cart is empty. Add items to cart before placing order.',
          details: {}
        }
      });
    }

    // Validate cart items and stock
    const validationResults = await cart.validateItems();
    if (!validationResults.valid) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CART_VALIDATION_FAILED',
          message: 'Cart validation failed. Please review your cart.',
          details: { issues: validationResults.issues }
        }
      });
    }

    // Populate cart with product details
    await cart.getPopulatedCart();

    // Prepare order items
    const orderItems = cart.items.map(item => {
      const product = item.productId;
      const price = product.discountPrice || product.price;
      return {
        productId: product._id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        subtotal: price * item.quantity
      };
    });

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;
    
    // Extract only the required shipping address fields
    const cleanedShippingAddress = {
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      phone: shippingAddress.phone
    };
    
    const orderData = {
      orderNumber,
      customerId: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: cleanedShippingAddress,
      paymentMethod
    };
    
    // Only add notes if provided
    if (notes && typeof notes === 'string' && notes.trim()) {
      orderData.notes = notes.trim();
    }

    // Create order
    const order = await Order.create(orderData);

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findByIdAndUpdate(
        item.productId._id,
        {
          $inc: { 'stock.quantity': -item.quantity }
        },
        { new: true }
      );

      // Emit real-time stock update
      socketService.emitStockUpdate(product._id, {
        quantity: product.stock.quantity,
        inStock: product.stock.inStock,
        isLowStock: product.isLowStock
      });

      // Check for low stock and send alert
      if (product.isLowStock) {
        socketService.emitLowStockAlert({
          _id: product._id,
          name: product.name,
          partNumber: product.partNumber,
          stock: product.stock
        });
        
        // Send email alert
        notificationService.sendLowStockAlert(product);
      }

      // Invalidate product cache
      await cacheService.invalidateProduct(product._id);
    }

    // Clear cart after successful order
    await cart.clearCart();

    // Populate order for response
    await order.populate('customerId', 'firstName lastName email phone');

    // Send order confirmation email
    const customer = order.customerId;
    notificationService.sendOrderConfirmation(order, customer);

    // Emit new order notification to admin
    socketService.emitNewOrderNotification({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: `${customer.firstName} ${customer.lastName}`,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    });

    // Invalidate admin stats cache
    await cacheService.invalidateAdminStats();

    res.status(201).json({
      success: true,
      data: { 
        order,
        message: 'Order placed successfully'
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { errors }
        }
      });
    }
    
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    
    const query = { customerId: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name images brand partNumber')
      .select('-__v');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.productId', 'name images brand partNumber category')
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
          details: {}
        }
      });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only view your own orders.',
          details: {}
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_ID',
          message: 'Invalid order ID format',
          details: {}
        }
      });
    }
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
          details: {}
        }
      });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied. You can only cancel your own orders.',
          details: {}
        }
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL_DELIVERED',
          message: 'Cannot cancel a delivered order',
          details: {}
        }
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CANCELLED',
          message: 'Order is already cancelled',
          details: {}
        }
      });
    }

    // Cancel order
    await order.cancelOrder(reason);

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { 'stock.quantity': item.quantity }
        }
      );
    }

    res.status(200).json({
      success: true,
      data: { 
        order,
        message: 'Order cancelled successfully'
      }
    });
  } catch (error) {
    if (error.message === 'Cannot cancel a delivered order') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL_DELIVERED',
          message: error.message,
          details: {}
        }
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_ID',
          message: 'Invalid order ID format',
          details: {}
        }
      });
    }
    
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
          details: {}
        }
      });
    }

    const oldStatus = order.orderStatus;

    // Update order status
    order.orderStatus = status;
    if (notes) order.notes = notes;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    // Populate for response and notifications
    await order.populate('customerId', 'firstName lastName email phone');

    // Send status update notification
    const customer = order.customerId;
    notificationService.sendOrderStatusUpdate(order, customer, oldStatus, status);

    // Emit real-time order update to customer
    socketService.emitOrderUpdate(customer._id, {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      updatedAt: order.updatedAt
    });

    // Invalidate admin stats cache
    await cacheService.invalidateAdminStats();

    res.status(200).json({
      success: true,
      data: { 
        order,
        message: 'Order status updated successfully'
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { errors }
        }
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_ID',
          message: 'Invalid order ID format',
          details: {}
        }
      });
    }
    
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const customerId = req.query.customerId;
    
    const query = {};
    if (status) query.orderStatus = status;
    if (customerId) query.customerId = customerId;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.productId', 'name brand partNumber')
      .select('-__v');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await Order.getOrderStats(startDate, endDate);
    
    // Get recent orders
    const recentOrders = await Order.findRecentOrders(7, 10);
    
    // Calculate totals
    const totalOrders = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        summary: {
          totalOrders,
          totalRevenue
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderStats
};