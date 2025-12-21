const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(pincode) {
        return /^\d{6}$/.test(pincode);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(phone) {
        return /^[6-9]\d{9}$/.test(phone);
      },
      message: 'Please provide a valid 10-digit Indian phone number'
    }
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cod', 'razorpay', 'stripe'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  cancelReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is delivered
orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'delivered';
});

// Virtual for is cancelled
orderSchema.virtual('isCancelled').get(function() {
  return this.orderStatus === 'cancelled';
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Pre-save middleware to validate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    const calculatedTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Allow small floating point differences
    if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
      return next(new Error('Total amount does not match sum of item subtotals'));
    }
  }
  next();
});

// Pre-save middleware to set delivery date for delivered orders
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && this.orderStatus === 'delivered' && !this.deliveryDate) {
    this.deliveryDate = new Date();
  }
  next();
});

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const query = this.find({ customerId })
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name images');
  
  if (options.status) {
    query.where('orderStatus').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to find recent orders
orderSchema.statics.findRecentOrders = function(days = 7, limit = 50) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({ createdAt: { $gte: startDate } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customerId', 'firstName lastName email');
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.orderStatus = newStatus;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancelOrder = function(reason) {
  if (this.orderStatus === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }
  
  this.orderStatus = 'cancelled';
  this.cancelReason = reason;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);