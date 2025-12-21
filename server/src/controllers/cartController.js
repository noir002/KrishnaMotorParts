const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user.id);
    await cart.getPopulatedCart();

    res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found or inactive',
          details: {}
        }
      });
    }

    // Check stock availability
    if (!product.stock.inStock) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'OUT_OF_STOCK',
          message: 'Product is currently out of stock',
          details: { productName: product.name }
        }
      });
    }

    if (quantity > product.stock.quantity) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Requested quantity exceeds available stock',
          details: { 
            productName: product.name,
            availableStock: product.stock.quantity,
            requestedQuantity: quantity
          }
        }
      });
    }

    // Get or create cart
    const cart = await Cart.findOrCreateForUser(req.user.id);
    
    // Add item to cart
    await cart.addItem(productId, quantity);
    await cart.getPopulatedCart();

    res.status(200).json({
      success: true,
      data: { 
        cart,
        message: 'Item added to cart successfully'
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
          code: 'INVALID_PRODUCT_ID',
          message: 'Invalid product ID format',
          details: {}
        }
      });
    }
    
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:productId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be a positive number',
          details: {}
        }
      });
    }

    // Get cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found',
          details: {}
        }
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await cart.removeItem(productId);
    } else {
      // Validate stock availability for new quantity
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found or inactive',
            details: {}
          }
        });
      }

      if (quantity > product.stock.quantity) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: 'Requested quantity exceeds available stock',
            details: { 
              productName: product.name,
              availableStock: product.stock.quantity,
              requestedQuantity: quantity
            }
          }
        });
      }

      await cart.updateItemQuantity(productId, quantity);
    }

    await cart.getPopulatedCart();

    res.status(200).json({
      success: true,
      data: { 
        cart,
        message: 'Cart updated successfully'
      }
    });
  } catch (error) {
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_IN_CART',
          message: 'Item not found in cart',
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found',
          details: {}
        }
      });
    }

    // Remove item
    await cart.removeItem(productId);
    await cart.getPopulatedCart();

    res.status(200).json({
      success: true,
      data: { 
        cart,
        message: 'Item removed from cart successfully'
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

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found',
          details: {}
        }
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      data: { 
        cart,
        message: 'Cart cleared successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate cart items against current stock
// @route   POST /api/cart/validate
// @access  Private
const validateCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found',
          details: {}
        }
      });
    }

    const validationResults = await cart.validateItems();
    await cart.getPopulatedCart();

    res.status(200).json({
      success: true,
      data: { 
        cart,
        validation: validationResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cart summary (item count and total)
// @route   GET /api/cart/summary
// @access  Private
const getCartSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { 
          summary: {
            itemCount: 0,
            totalItems: 0,
            totalAmount: 0,
            isEmpty: true
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { 
        summary: {
          itemCount: cart.itemCount,
          totalItems: cart.totalItems,
          totalAmount: cart.totalAmount,
          isEmpty: cart.isEmpty
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
  getCartSummary
};