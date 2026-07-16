const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  abandonmentTracking: {
    isAbandoned: {
      type: Boolean,
      default: false,
      index: true
    },
    abandonedAt: {
      type: Date,
      index: true
    },
    notificationsSent: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    lastNotificationSent: {
      type: Date
    },
    notificationTimestamps: [{
      type: Date
    }],
    convertedAfterNotification: {
      type: Boolean,
      default: false
    },
    conversionTimestamp: {
      type: Date
    },
    conversionReminderNumber: {
      type: Number,
      min: 1,
      max: 3
    },
    timeToConversion: {
      type: Number
    }
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
cartSchema.index({ userId: 1 }, { unique: true });
cartSchema.index({ 'items.productId': 1 });
cartSchema.index({ updatedAt: -1 });

// Compound index for efficient abandoned cart queries
cartSchema.index({ 
  'abandonmentTracking.isAbandoned': 1, 
  'abandonmentTracking.notificationsSent': 1,
  'lastModifiedAt': -1 
});

// Virtual for cart item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Virtual for is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    // Update lastModifiedAt timestamp
    this.lastModifiedAt = new Date();
    
    // Calculate total items
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate total amount by populating product prices
    if (this.items.length > 0) {
      await this.populate('items.productId', 'price discountPrice');
      
      this.totalAmount = this.items.reduce((sum, item) => {
        if (item.productId) {
          const price = item.productId.discountPrice || item.productId.price;
          return sum + (price * item.quantity);
        }
        return sum;
      }, 0);
    } else {
      this.totalAmount = 0;
    }
  }
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    
    // Ensure quantity doesn't exceed maximum
    if (this.items[existingItemIndex].quantity > 100) {
      this.items[existingItemIndex].quantity = 100;
    }
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity: Math.min(quantity, 100),
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.splice(itemIndex, 1);
  } else {
    // Update quantity (max 100)
    this.items[itemIndex].quantity = Math.min(quantity, 100);
  }
  
  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Instance method to get cart with populated products
cartSchema.methods.getPopulatedCart = function() {
  return this.populate({
    path: 'items.productId',
    select: 'name price discountPrice images stock brand partNumber',
    match: { isActive: true }
  });
};

// Instance method to mark cart as abandoned
cartSchema.methods.markAsAbandoned = async function() {
  try {
    this.abandonmentTracking.isAbandoned = true;
    this.abandonmentTracking.abandonedAt = new Date();
    return await this.save();
  } catch (error) {
    console.error('[Cart] Database error marking cart as abandoned:', {
      cartId: this._id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Instance method to record notification sent
cartSchema.methods.recordNotificationSent = async function() {
  try {
    const now = new Date();
    this.abandonmentTracking.notificationsSent += 1;
    this.abandonmentTracking.lastNotificationSent = now;
    this.abandonmentTracking.notificationTimestamps.push(now);
    return await this.save();
  } catch (error) {
    console.error('[Cart] Database error recording notification sent:', {
      cartId: this._id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Instance method to record conversion
cartSchema.methods.recordConversion = async function(reminderNumber) {
  try {
    const now = new Date();
    this.abandonmentTracking.convertedAfterNotification = true;
    this.abandonmentTracking.conversionReminderNumber = reminderNumber;
    this.abandonmentTracking.conversionTimestamp = now;
    
    // Calculate time elapsed since last notification
    if (this.abandonmentTracking.lastNotificationSent) {
      const timeElapsed = now - this.abandonmentTracking.lastNotificationSent;
      // Store time elapsed in milliseconds for later analysis
      this.abandonmentTracking.timeToConversion = timeElapsed;
    }
    
    return await this.save();
  } catch (error) {
    console.error('[Cart] Database error recording conversion:', {
      cartId: this._id,
      reminderNumber,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ userId });
  
  if (!cart) {
    cart = new this({ userId });
    await cart.save();
  }
  
  return cart;
};

// Static method to cleanup old empty carts
cartSchema.statics.cleanupOldCarts = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    items: { $size: 0 },
    updatedAt: { $lt: cutoffDate }
  });
};

// Static method to get cart statistics
cartSchema.statics.getCartStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalCarts: { $sum: 1 },
        totalItems: { $sum: '$totalItems' },
        totalValue: { $sum: '$totalAmount' },
        averageCartValue: { $avg: '$totalAmount' },
        averageItemsPerCart: { $avg: '$totalItems' }
      }
    }
  ]);
};

// Instance method to validate cart items against current product data
cartSchema.methods.validateItems = async function() {
  const validationResults = {
    valid: true,
    issues: []
  };
  
  await this.populate('items.productId');
  
  for (let i = this.items.length - 1; i >= 0; i--) {
    const item = this.items[i];
    
    if (!item.productId) {
      // Product no longer exists
      this.items.splice(i, 1);
      validationResults.valid = false;
      validationResults.issues.push({
        type: 'product_not_found',
        message: 'Product no longer available'
      });
      continue;
    }
    
    if (!item.productId.isActive) {
      // Product is inactive
      this.items.splice(i, 1);
      validationResults.valid = false;
      validationResults.issues.push({
        type: 'product_inactive',
        productName: item.productId.name,
        message: `${item.productId.name} is no longer available`
      });
      continue;
    }
    
    if (!item.productId.stock.inStock) {
      // Product is out of stock
      validationResults.valid = false;
      validationResults.issues.push({
        type: 'out_of_stock',
        productName: item.productId.name,
        message: `${item.productId.name} is currently out of stock`
      });
    }
    
    if (item.quantity > item.productId.stock.quantity) {
      // Requested quantity exceeds available stock
      item.quantity = item.productId.stock.quantity;
      validationResults.valid = false;
      validationResults.issues.push({
        type: 'quantity_adjusted',
        productName: item.productId.name,
        newQuantity: item.quantity,
        message: `${item.productId.name} quantity adjusted to available stock`
      });
    }
  }
  
  if (!validationResults.valid) {
    await this.save();
  }
  
  return validationResults;
};

module.exports = mongoose.model('Cart', cartSchema);