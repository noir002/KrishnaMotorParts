const mongoose = require('mongoose');

const compatibilitySchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5
  }
}, { _id: false });

const stockSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  inStock: {
    type: Boolean,
    default: function() {
      return this.quantity > 0;
    }
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  partNumber: {
    type: String,
    required: [true, 'Part number is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Part number cannot exceed 50 characters']
  },
  compatibility: [compatibilitySchema],
  specifications: {
    type: Map,
    of: String,
    default: new Map()
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        // Allow http/https URLs or data URLs
        return /^https?:\/\/.+/.test(url) || /^data:image\/.+/.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  stock: {
    type: stockSchema,
    required: true,
    default: () => ({})
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
productSchema.index({ category: 1, price: 1, 'stock.inStock': 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ partNumber: 1 }, { unique: true });
productSchema.index({ 'compatibility.make': 1, 'compatibility.model': 1 });
productSchema.index({ isActive: 1 });

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  if (!this.stock || typeof this.stock.quantity === 'undefined') {
    return false;
  }
  return this.stock.quantity <= this.stock.lowStockThreshold;
});

// Pre-save middleware to update inStock status
productSchema.pre('save', function(next) {
  if (this.isModified('stock.quantity')) {
    this.stock.inStock = this.stock.quantity > 0;
  }
  next();
});

// Static method to find products by compatibility
productSchema.statics.findByCompatibility = function(make, model, year) {
  return this.find({
    'compatibility.make': new RegExp(make, 'i'),
    'compatibility.model': new RegExp(model, 'i'),
    'compatibility.year': year,
    isActive: true
  });
};

// Static method for search with filters
productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = { isActive: true };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.brand) {
    query.brand = new RegExp(filters.brand, 'i');
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  if (filters.inStock) {
    query['stock.inStock'] = true;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Product', productSchema);