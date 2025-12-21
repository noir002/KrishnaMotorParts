const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    // Get basic counts
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      lowStockCount,
      monthlyOrders,
      weeklyOrders,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer', isActive: true }),
      Order.countDocuments(),
      Product.countDocuments({ 
        isActive: true,
        $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
      }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'processing'] } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customerId', 'firstName lastName email')
        .select('orderNumber totalAmount orderStatus createdAt')
    ]);

    // Calculate revenue
    const revenueStats = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'cancelled' },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfMonth] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalCustomers,
          totalOrders,
          lowStockCount,
          totalRevenue: revenue.totalRevenue,
          monthlyRevenue: revenue.monthlyRevenue
        },
        orders: {
          monthly: monthlyOrders,
          weekly: weeklyOrders,
          pending: pendingOrders
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/admin/inventory/report
// @access  Private/Admin
const getInventoryReport = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, lowStock, search } = req.query;
    const skip = (page - 1) * limit;

    // Build base query
    let pipeline = [
      { $match: { isActive: true } }
    ];

    // Add category filter
    if (category) {
      pipeline[0].$match.category = category;
    }

    // Add search filter
    if (search) {
      pipeline[0].$match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Add low stock filter
    if (lowStock === 'true') {
      pipeline.push({
        $match: {
          $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
        }
      });
    }

    // Add pagination
    pipeline.push(
      { $sort: { 'stock.quantity': 1, name: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: 1,
          partNumber: 1,
          brand: 1,
          price: 1,
          stock: 1,
          category: { name: '$category.name' },
          createdAt: 1
        }
      }
    );

    const products = await Product.aggregate(pipeline);

    // Get total count with same filters
    let countPipeline = [
      { $match: { isActive: true } }
    ];

    if (category) {
      countPipeline[0].$match.category = category;
    }

    if (search) {
      countPipeline[0].$match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (lowStock === 'true') {
      countPipeline.push({
        $match: {
          $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
        }
      });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    // Get inventory summary
    const inventorySummary = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock.quantity' },
          lowStockItems: {
            $sum: {
              $cond: {
                if: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] },
                then: 1,
                else: 0
              }
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: {
                if: { $eq: ['$stock.quantity', 0] },
                then: 1,
                else: 0
              }
            }
          },
          totalValue: { $sum: { $multiply: ['$price', '$stock.quantity'] } }
        }
      }
    ]);

    const summary = inventorySummary[0] || {
      totalProducts: 0,
      totalStock: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalValue: 0
    };

    res.status(200).json({
      success: true,
      data: {
        products,
        summary,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/admin/inventory/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
    })
    .populate('category', 'name')
    .select('name partNumber brand stock category')
    .sort({ 'stock.quantity': 1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        products: lowStockProducts,
        count: lowStockProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock
// @route   PUT /api/admin/inventory/stock/:productId
// @access  Private/Admin
const updateProductStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, lowStockThreshold } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Stock quantity cannot be negative',
          details: {}
        }
      });
    }

    const updateData = {};
    if (quantity !== undefined) {
      updateData['stock.quantity'] = quantity;
      updateData['stock.inStock'] = quantity > 0;
    }
    if (lowStockThreshold !== undefined) {
      updateData['stock.lowStockThreshold'] = lowStockThreshold;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
          details: {}
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          partNumber: product.partNumber,
          stock: product.stock,
          category: product.category
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update products
// @route   PUT /api/admin/inventory/bulk-update
// @access  Private/Admin
const bulkUpdateProducts = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_UPDATES',
          message: 'Updates array is required and cannot be empty',
          details: {}
        }
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const update of updates) {
      try {
        const { productId, quantity, lowStockThreshold, price } = update;
        
        const updateData = {};
        if (quantity !== undefined) {
          updateData['stock.quantity'] = quantity;
          updateData['stock.inStock'] = quantity > 0;
        }
        if (lowStockThreshold !== undefined) {
          updateData['stock.lowStockThreshold'] = lowStockThreshold;
        }
        if (price !== undefined) {
          updateData.price = price;
        }

        const product = await Product.findByIdAndUpdate(
          productId,
          updateData,
          { new: true, runValidators: true }
        );

        if (product) {
          results.successful.push({
            productId,
            name: product.name,
            updated: Object.keys(updateData)
          });
        } else {
          results.failed.push({
            productId,
            error: 'Product not found'
          });
        }
      } catch (error) {
        results.failed.push({
          productId: update.productId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        summary: {
          total: updates.length,
          successful: results.successful.length,
          failed: results.failed.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus, 
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let ordersQuery = Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const customerIds = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      }).distinct('_id');

      query.$or = [
        { orderNumber: searchRegex },
        { customerId: { $in: customerIds } }
      ];
      
      ordersQuery = Order.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    const [orders, totalCount] = await Promise.all([
      ordersQuery,
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/admin/orders/:orderId
// @access  Private/Admin
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customerId', 'firstName lastName email phone addresses')
      .populate('items.productId', 'name images partNumber brand');

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

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, notes, trackingNumber } = req.body;

    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid order status',
          details: { validStatuses }
        }
      });
    }

    const updateData = { orderStatus: status };
    if (notes) updateData.notes = notes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'delivered') updateData.deliveryDate = new Date();

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email');

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

    // TODO: Send notification to customer about status update
    // This would typically integrate with an email service

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order analytics
// @route   GET /api/admin/analytics/orders
// @access  Private/Admin
const getOrderAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get order statistics
    const [orderStats, statusDistribution, dailyOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        overview: stats,
        statusDistribution,
        dailyTrends: dailyOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales report
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
const getSalesReport = async (req, res, next) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Determine grouping format
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const [salesData, topProducts, topCategories] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            name: { $first: '$category.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.subtotal' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        groupBy,
        dateRange: { startDate, endDate },
        salesTrends: salesData,
        topProducts,
        topCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer analytics
// @route   GET /api/admin/analytics/customers
// @access  Private/Admin
const getCustomerAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const [customerStats, topCustomers, newCustomers] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: 'customer',
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'customerId',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalOrders: { $size: '$orders' },
            totalSpent: { $sum: '$orders.totalAmount' },
            recentOrders: {
              $size: {
                $filter: {
                  input: '$orders',
                  cond: { $gte: ['$$this.createdAt', startDate] }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $gt: ['$recentOrders', 0] }, 1, 0] }
            },
            averageOrdersPerCustomer: { $avg: '$totalOrders' },
            averageSpentPerCustomer: { $avg: '$totalSpent' }
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            role: 'customer',
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'customerId',
            as: 'orders'
          }
        },
        {
          $addFields: {
            totalOrders: { $size: '$orders' },
            totalSpent: { $sum: '$orders.totalAmount' }
          }
        },
        {
          $match: {
            totalOrders: { $gt: 0 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            totalOrders: 1,
            totalSpent: 1
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            role: 'customer',
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            newCustomers: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    const stats = customerStats[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      averageOrdersPerCustomer: 0,
      averageSpentPerCustomer: 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        overview: stats,
        topCustomers,
        newCustomerTrends: newCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export orders data
// @route   GET /api/admin/export/orders
// @access  Private/Admin
const exportOrdersData = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      format = 'json' 
    } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Order Number',
        'Customer Name',
        'Customer Email',
        'Total Amount',
        'Order Status',
        'Payment Status',
        'Created Date',
        'Delivery Date'
      ];

      const csvRows = orders.map(order => [
        order.orderNumber,
        `${order.customerId.firstName} ${order.customerId.lastName}`,
        order.customerId.email,
        order.totalAmount,
        order.orderStatus,
        order.paymentStatus,
        order.createdAt.toISOString().split('T')[0],
        order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
      return res.send(csvContent);
    }

    res.status(200).json({
      success: true,
      data: {
        orders,
        exportInfo: {
          totalRecords: orders.length,
          exportDate: new Date(),
          filters: { startDate, endDate, status }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export products data
// @route   GET /api/admin/export/products
// @access  Private/Admin
const exportProductsData = async (req, res, next) => {
  try {
    const { 
      category, 
      lowStock, 
      format = 'json' 
    } = req.query;

    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ name: 1 })
      .lean();

    if (format === 'csv') {
      const csvHeaders = [
        'Name',
        'Part Number',
        'Brand',
        'Category',
        'Price',
        'Stock Quantity',
        'Low Stock Threshold',
        'In Stock',
        'Created Date'
      ];

      const csvRows = products.map(product => [
        product.name,
        product.partNumber,
        product.brand,
        product.category.name,
        product.price,
        product.stock.quantity,
        product.stock.lowStockThreshold,
        product.stock.inStock ? 'Yes' : 'No',
        product.createdAt.toISOString().split('T')[0]
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
      return res.send(csvContent);
    }

    res.status(200).json({
      success: true,
      data: {
        products,
        exportInfo: {
          totalRecords: products.length,
          exportDate: new Date(),
          filters: { category, lowStock }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};