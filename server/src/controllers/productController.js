const Product = require('../models/Product');
const Category = require('../models/Category');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');
const cacheService = require('../services/cacheService');

// @desc    Get all products with filtering and search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = { isActive: true };
    
    // Text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Brand filter
    if (req.query.brand) {
      query.brand = new RegExp(req.query.brand, 'i');
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (!isNaN(minPrice)) query.price.$gte = minPrice;
      }
      if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
      }
    }
    
    // Stock filter
    if (req.query.inStock === 'true') {
      query['stock.inStock'] = true;
    }
    
    // Vehicle compatibility filter
    if (req.query.make || req.query.model || req.query.year) {
      const compatibilityQuery = {};
      if (req.query.make) {
        compatibilityQuery['compatibility.make'] = new RegExp(req.query.make, 'i');
      }
      if (req.query.model) {
        compatibilityQuery['compatibility.model'] = new RegExp(req.query.model, 'i');
      }
      if (req.query.year) {
        const year = parseInt(req.query.year);
        if (!isNaN(year)) {
          compatibilityQuery['compatibility.year'] = year;
        }
      }
      Object.assign(query, compatibilityQuery);
    }
    
    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'name_asc':
          sort = { name: 1 };
          break;
        case 'name_desc':
          sort = { name: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        default:
          // If text search is used, sort by text score
          if (req.query.search) {
            sort = { score: { $meta: 'textScore' } };
          } else {
            sort = { createdAt: -1 };
          }
      }
    } else {
      // Default sort
      if (req.query.search) {
        sort = { score: { $meta: 'textScore' } };
      } else {
        sort = { createdAt: -1 };
      }
    }
    
    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        products,
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

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .select('-__v');

    if (!product || !product.isActive) {
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
      data: { product }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format',
          details: {}
        }
      });
    }
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
          details: {}
        }
      });
    }

    const limit = parseInt(req.query.limit) || 6;
    
    // Find related products based on category, brand, or compatibility
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand },
        { 'compatibility.make': { $in: product.compatibility.map(c => c.make) } }
      ]
    })
    .populate('category', 'name slug')
    .limit(limit)
    .select('-__v');

    res.status(200).json({
      success: true,
      data: { products: relatedProducts }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format',
          details: {}
        }
      });
    }
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    // Validate category exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category || !category.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category not found or inactive',
            details: {}
          }
        });
      }
    }

    const product = await Product.create(req.body);
    
    // Populate category for response
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: { product }
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
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_PART_NUMBER',
          message: 'Product with this part number already exists',
          details: {}
        }
      });
    }
    
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    // Validate category if provided
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category || !category.isActive) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category not found or inactive',
            details: {}
          }
        });
      }
    }

    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
          details: {}
        }
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name slug');

    // Check for stock changes and emit real-time updates
    if (req.body.stock && oldProduct.stock.quantity !== product.stock.quantity) {
      // Emit stock update to connected clients
      socketService.emitStockUpdate(product._id, {
        quantity: product.stock.quantity,
        inStock: product.stock.inStock,
        isLowStock: product.isLowStock
      });

      // Check for low stock and send alert
      if (product.isLowStock && !oldProduct.isLowStock) {
        socketService.emitLowStockAlert({
          _id: product._id,
          name: product.name,
          partNumber: product.partNumber,
          stock: product.stock
        });
        
        // Send email alert
        notificationService.sendLowStockAlert(product);
      }
    }

    // Invalidate cache
    await cacheService.invalidateProduct(product._id);

    res.status(200).json({
      success: true,
      data: { product }
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
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_PART_NUMBER',
          message: 'Product with this part number already exists',
          details: {}
        }
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format',
          details: {}
        }
      });
    }
    
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

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
        message: 'Product deactivated successfully'
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format',
          details: {}
        }
      });
    }
    next(error);
  }
};

// @desc    Search products by compatibility
// @route   GET /api/products/compatibility/:make/:model/:year
// @access  Public
const getProductsByCompatibility = async (req, res, next) => {
  try {
    const { make, model, year } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_YEAR',
          message: 'Year must be a valid number',
          details: {}
        }
      });
    }

    const products = await Product.findByCompatibility(make, model, yearNum)
      .populate('category', 'name slug')
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Product.countDocuments({
      'compatibility.make': new RegExp(make, 'i'),
      'compatibility.model': new RegExp(model, 'i'),
      'compatibility.year': yearNum,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        products,
        compatibility: { make, model, year: yearNum },
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

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: { brands: brands.sort() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle makes for compatibility
// @route   GET /api/products/compatibility/makes
// @access  Public
const getVehicleMakes = async (req, res, next) => {
  try {
    const makes = await Product.distinct('compatibility.make', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: { makes: makes.sort() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle models for a specific make
// @route   GET /api/products/compatibility/makes/:make/models
// @access  Public
const getVehicleModels = async (req, res, next) => {
  try {
    const { make } = req.params;
    
    const models = await Product.distinct('compatibility.model', {
      'compatibility.make': new RegExp(make, 'i'),
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      data: { 
        make,
        models: models.sort() 
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle years for a specific make and model
// @route   GET /api/products/compatibility/makes/:make/models/:model/years
// @access  Public
const getVehicleYears = async (req, res, next) => {
  try {
    const { make, model } = req.params;
    
    const years = await Product.distinct('compatibility.year', {
      'compatibility.make': new RegExp(make, 'i'),
      'compatibility.model': new RegExp(model, 'i'),
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      data: { 
        make,
        model,
        years: years.sort((a, b) => b - a) // Sort years descending
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCompatibility,
  getBrands,
  getVehicleMakes,
  getVehicleModels,
  getVehicleYears
};