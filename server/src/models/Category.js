const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: 0
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for full path (for breadcrumbs)
categorySchema.virtual('fullPath').get(function() {
  // This will be populated by a method since virtuals can't be async
  return this._fullPath || this.name;
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  next();
});

// Pre-save middleware to prevent circular references
categorySchema.pre('save', async function(next) {
  if (this.parentCategory && this.isModified('parentCategory')) {
    // Check if the parent category exists
    const parent = await this.constructor.findById(this.parentCategory);
    if (!parent) {
      return next(new Error('Parent category does not exist'));
    }
    
    // Check for circular reference
    if (await this.wouldCreateCircularReference(this.parentCategory)) {
      return next(new Error('Cannot set parent category: would create circular reference'));
    }
  }
  next();
});

// Instance method to check for circular references
categorySchema.methods.wouldCreateCircularReference = async function(parentId) {
  if (!parentId) return false;
  
  let currentParent = parentId;
  const visited = new Set();
  
  while (currentParent) {
    // If we've seen this ID before, there's a cycle
    if (visited.has(currentParent.toString())) {
      return true;
    }
    
    // If the parent is this category itself, it's a direct cycle
    if (currentParent.toString() === this._id.toString()) {
      return true;
    }
    
    visited.add(currentParent.toString());
    
    // Get the next parent
    const parent = await this.constructor.findById(currentParent);
    currentParent = parent ? parent.parentCategory : null;
  }
  
  return false;
};

// Instance method to get full category path
categorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parentCategory) {
    current = await this.constructor.findById(current.parentCategory);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (categoryId) => {
    const children = await this.constructor.find({ parentCategory: categoryId, isActive: true });
    
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ 
    parentCategory: null, 
    isActive: true 
  }).sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        const catParentId = cat.parentCategory ? cat.parentCategory.toString() : null;
        return catParentId === parentId;
      })
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id.toString())
      }));
  };
  
  return buildTree();
};

// Static method to find by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true });
};

// Static method to search categories
categorySchema.statics.searchCategories = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { name: regex },
      { description: regex }
    ],
    isActive: true
  }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);