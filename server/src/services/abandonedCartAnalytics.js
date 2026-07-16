const Cart = require('../models/Cart');

/**
 * Calculate abandonment rate for a given date range
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Abandonment rate statistics
 */
async function calculateAbandonmentRate(startDate, endDate) {
  try {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.lastModifiedAt = {};
      if (startDate) dateFilter.lastModifiedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.lastModifiedAt.$lte = new Date(endDate);
    }

    const [totalCarts, abandonedCarts] = await Promise.all([
      // Total carts with items in date range
      Cart.countDocuments({
        ...dateFilter,
        totalItems: { $gt: 0 }
      }),
      // Abandoned carts in date range
      Cart.countDocuments({
        ...dateFilter,
        'abandonmentTracking.isAbandoned': true
      })
    ]);

    const abandonmentRate = totalCarts > 0 
      ? ((abandonedCarts / totalCarts) * 100).toFixed(2)
      : 0;

    return {
      totalCarts,
      abandonedCarts,
      abandonmentRate: parseFloat(abandonmentRate)
    };
  } catch (error) {
    throw new Error(`Failed to calculate abandonment rate: ${error.message}`);
  }
}

/**
 * Calculate recovery rate for abandoned carts
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Recovery rate statistics
 */
async function calculateRecoveryRate(startDate, endDate) {
  try {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter['abandonmentTracking.abandonedAt'] = {};
      if (startDate) dateFilter['abandonmentTracking.abandonedAt'].$gte = new Date(startDate);
      if (endDate) dateFilter['abandonmentTracking.abandonedAt'].$lte = new Date(endDate);
    }

    const [totalAbandoned, recoveredCarts] = await Promise.all([
      // Total abandoned carts with notifications sent
      Cart.countDocuments({
        ...dateFilter,
        'abandonmentTracking.isAbandoned': true,
        'abandonmentTracking.notificationsSent': { $gt: 0 }
      }),
      // Recovered carts (converted after notification)
      Cart.countDocuments({
        ...dateFilter,
        'abandonmentTracking.convertedAfterNotification': true
      })
    ]);

    const recoveryRate = totalAbandoned > 0
      ? ((recoveredCarts / totalAbandoned) * 100).toFixed(2)
      : 0;

    return {
      totalAbandoned,
      recoveredCarts,
      recoveryRate: parseFloat(recoveryRate)
    };
  } catch (error) {
    throw new Error(`Failed to calculate recovery rate: ${error.message}`);
  }
}

/**
 * Calculate total revenue recovered from abandoned cart notifications
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Revenue recovery statistics
 */
async function calculateRevenueRecovered(startDate, endDate) {
  try {
    const dateFilter = {
      'abandonmentTracking.convertedAfterNotification': true
    };

    if (startDate || endDate) {
      dateFilter['abandonmentTracking.conversionTimestamp'] = {};
      if (startDate) dateFilter['abandonmentTracking.conversionTimestamp'].$gte = new Date(startDate);
      if (endDate) dateFilter['abandonmentTracking.conversionTimestamp'].$lte = new Date(endDate);
    }

    const revenueStats = await Cart.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCarts: { $sum: 1 },
          averageCartValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const stats = revenueStats[0] || {
      totalRevenue: 0,
      totalCarts: 0,
      averageCartValue: 0
    };

    return {
      totalRevenue: stats.totalRevenue,
      recoveredCarts: stats.totalCarts,
      averageCartValue: stats.averageCartValue
    };
  } catch (error) {
    throw new Error(`Failed to calculate revenue recovered: ${error.message}`);
  }
}

/**
 * Get conversion metrics broken down by reminder number
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Conversion metrics by reminder number
 */
async function getConversionsByReminderNumber(startDate, endDate) {
  try {
    const dateFilter = {
      'abandonmentTracking.convertedAfterNotification': true
    };
                                          
    if (startDate || endDate) {
      dateFilter['abandonmentTracking.conversionTimestamp'] = {};
      if (startDate) dateFilter['abandonmentTracking.conversionTimestamp'].$gte = new Date(startDate);
      if (endDate) dateFilter['abandonmentTracking.conversionTimestamp'].$lte = new Date(endDate);
    }

    const conversionsByReminder = await Cart.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$abandonmentTracking.conversionReminderNumber',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageCartValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total conversions for percentage calculation
    const totalConversions = conversionsByReminder.reduce((sum, item) => sum + item.count, 0);

    // Format results with percentages
    const formattedResults = conversionsByReminder.map(item => ({
      reminderNumber: item._id,
      conversions: item.count,
      conversionRate: totalConversions > 0 
        ? parseFloat(((item.count / totalConversions) * 100).toFixed(2))
        : 0,
      totalRevenue: item.totalRevenue,
      averageCartValue: item.averageCartValue
    }));

    return {
      byReminderNumber: formattedResults,
      totalConversions
    };
  } catch (error) {
    throw new Error(`Failed to get conversions by reminder number: ${error.message}`);
  }
}

/**
 * Calculate average time between notification and conversion
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Average conversion time statistics
 */
async function getAverageConversionTime(startDate, endDate) {
  try {
    const dateFilter = {
      'abandonmentTracking.convertedAfterNotification': true,
      'abandonmentTracking.timeToConversion': { $exists: true, $ne: null }
    };

    if (startDate || endDate) {
      dateFilter['abandonmentTracking.conversionTimestamp'] = {};
      if (startDate) dateFilter['abandonmentTracking.conversionTimestamp'].$gte = new Date(startDate);
      if (endDate) dateFilter['abandonmentTracking.conversionTimestamp'].$lte = new Date(endDate);
    }

    const conversionTimeStats = await Cart.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          averageTimeMs: { $avg: '$abandonmentTracking.timeToConversion' },
          minTimeMs: { $min: '$abandonmentTracking.timeToConversion' },
          maxTimeMs: { $max: '$abandonmentTracking.timeToConversion' },
          totalConversions: { $sum: 1 }
        }
      }
    ]);

    const stats = conversionTimeStats[0];

    if (!stats) {
      return {
        averageTimeMs: 0,
        averageTimeHours: 0,
        minTimeMs: 0,
        maxTimeMs: 0,
        totalConversions: 0
      };
    }

    return {
      averageTimeMs: stats.averageTimeMs,
      averageTimeHours: parseFloat((stats.averageTimeMs / (1000 * 60 * 60)).toFixed(2)),
      minTimeMs: stats.minTimeMs,
      maxTimeMs: stats.maxTimeMs,
      totalConversions: stats.totalConversions
    };
  } catch (error) {
    throw new Error(`Failed to calculate average conversion time: ${error.message}`);
  }
}

/**
 * Get comprehensive abandoned cart statistics
 * @param {Date} startDate - Start date for the query
 * @param {Date} endDate - End date for the query
 * @returns {Promise<Object>} Comprehensive statistics
 */
async function getComprehensiveStats(startDate, endDate) {
  try {
    const [
      abandonmentRate,
      recoveryRate,
      revenueRecovered,
      conversionsByReminder,
      averageConversionTime
    ] = await Promise.all([
      calculateAbandonmentRate(startDate, endDate),
      calculateRecoveryRate(startDate, endDate),
      calculateRevenueRecovered(startDate, endDate),
      getConversionsByReminderNumber(startDate, endDate),
      getAverageConversionTime(startDate, endDate)
    ]);

    return {
      abandonmentRate,
      recoveryRate,
      revenueRecovered,
      conversionsByReminder,
      averageConversionTime,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };
  } catch (error) {
    throw new Error(`Failed to get comprehensive stats: ${error.message}`);
  }
}

module.exports = {
  calculateAbandonmentRate,
  calculateRecoveryRate,
  calculateRevenueRecovered,
  getConversionsByReminderNumber,
  getAverageConversionTime,
  getComprehensiveStats
};
