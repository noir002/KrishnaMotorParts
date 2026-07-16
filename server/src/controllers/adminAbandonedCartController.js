const Cart = require('../models/Cart');
const User = require('../models/User');
const {
  calculateAbandonmentRate,
  calculateRecoveryRate,
  calculateRevenueRecovered,
  getConversionsByReminderNumber,
  getAverageConversionTime,
  getComprehensiveStats
} = require('../services/abandonedCartAnalytics');

/**
 * @desc    Get abandoned cart statistics
 * @route   GET /api/admin/abandoned-carts/stats
 * @access  Private/Admin
 */
const getAbandonedCartStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    let start = null;
    let end = null;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid startDate format',
            details: {}
          }
        });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid endDate format',
            details: {}
          }
        });
      }
    }

    // Get comprehensive statistics
    const stats = await getComprehensiveStats(start, end);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated list of abandoned carts
 * @route   GET /api/admin/abandoned-carts
 * @access  Private/Admin
 */
const getAbandonedCarts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      notificationCount,
      startDate,
      endDate,
      sortBy = 'abandonedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      'abandonmentTracking.isAbandoned': true
    };

    // Filter by conversion status
    if (status === 'converted') {
      query['abandonmentTracking.convertedAfterNotification'] = true;
    } else if (status === 'not_converted') {
      query['abandonmentTracking.convertedAfterNotification'] = { $ne: true };
    }

    // Filter by notification count
    if (notificationCount) {
      const count = parseInt(notificationCount);
      if (!isNaN(count)) {
        query['abandonmentTracking.notificationsSent'] = count;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      query['abandonmentTracking.abandonedAt'] = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          query['abandonmentTracking.abandonedAt'].$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          query['abandonmentTracking.abandonedAt'].$lte = end;
        }
      }
    }

    // Build sort object
    const sort = {};
    const sortField = sortBy === 'abandonedAt' 
      ? 'abandonmentTracking.abandonedAt'
      : sortBy === 'totalAmount'
      ? 'totalAmount'
      : sortBy === 'notificationsSent'
      ? 'abandonmentTracking.notificationsSent'
      : 'abandonmentTracking.abandonedAt';
    
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [carts, totalCount] = await Promise.all([
      Cart.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('items.productId', 'name partNumber price discountPrice images')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Cart.countDocuments(query)
    ]);

    // Format response data
    const formattedCarts = carts.map(cart => ({
      id: cart._id,
      user: cart.userId ? {
        id: cart.userId._id,
        firstName: cart.userId.firstName,
        lastName: cart.userId.lastName,
        email: cart.userId.email
      } : null,
      items: cart.items.map(item => ({
        product: item.productId ? {
          id: item.productId._id,
          name: item.productId.name,
          partNumber: item.productId.partNumber,
          price: item.productId.price,
          discountPrice: item.productId.discountPrice,
          image: item.productId.images?.[0] || null
        } : null,
        quantity: item.quantity
      })),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      abandonmentTracking: {
        isAbandoned: cart.abandonmentTracking.isAbandoned,
        abandonedAt: cart.abandonmentTracking.abandonedAt,
        notificationsSent: cart.abandonmentTracking.notificationsSent,
        lastNotificationSent: cart.abandonmentTracking.lastNotificationSent,
        convertedAfterNotification: cart.abandonmentTracking.convertedAfterNotification,
        conversionTimestamp: cart.abandonmentTracking.conversionTimestamp,
        conversionReminderNumber: cart.abandonmentTracking.conversionReminderNumber
      },
      lastModifiedAt: cart.lastModifiedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        carts: formattedCarts,
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

/**
 * @desc    Get conversion metrics
 * @route   GET /api/admin/abandoned-carts/conversions
 * @access  Private/Admin
 */
const getConversionMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    let start = null;
    let end = null;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid startDate format',
            details: {}
          }
        });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid endDate format',
            details: {}
          }
        });
      }
    }

    // Get conversion metrics
    const [
      conversionsByReminder,
      averageConversionTime,
      recoveryRate,
      revenueRecovered
    ] = await Promise.all([
      getConversionsByReminderNumber(start, end),
      getAverageConversionTime(start, end),
      calculateRecoveryRate(start, end),
      calculateRevenueRecovered(start, end)
    ]);

    res.status(200).json({
      success: true,
      data: {
        conversionsByReminder,
        averageConversionTime,
        recoveryRate,
        revenueRecovered,
        dateRange: {
          startDate: start,
          endDate: end
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAbandonedCartStats,
  getAbandonedCarts,
  getConversionMetrics
};
