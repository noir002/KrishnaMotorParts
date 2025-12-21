const Joi = require('joi');

// Middleware to validate request body against a Joi schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
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

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

// Product validation schemas
const compatibilitySchema = Joi.object({
  make: Joi.string().trim().required().max(100),
  model: Joi.string().trim().required().max(100),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 5).required()
});

const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).default(0),
  lowStockThreshold: Joi.number().integer().min(0).default(5),
  inStock: Joi.boolean().optional()
});

const productSchema = Joi.object({
  name: Joi.string().trim().required().max(200),
  description: Joi.string().trim().required().max(2000),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  subcategory: Joi.string().trim().max(100).optional(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).optional(),
  brand: Joi.string().trim().required().max(100),
  partNumber: Joi.string().trim().required().max(50),
  compatibility: Joi.array().items(compatibilitySchema).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(
    Joi.string().uri().pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
  ).optional(),
  stock: stockSchema.optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isActive: Joi.boolean().default(true)
});

// Product update schema (all fields optional except validation rules)
const productUpdateSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  subcategory: Joi.string().trim().max(100).optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional(),
  brand: Joi.string().trim().max(100).optional(),
  partNumber: Joi.string().trim().max(50).optional(),
  compatibility: Joi.array().items(compatibilitySchema).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(
    Joi.string().uri().pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
  ).optional(),
  stock: stockSchema.optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isActive: Joi.boolean().optional()
}).min(1); // At least one field must be provided

// Product validation middleware
const validateProduct = validate(productSchema);
const validateProductUpdate = validate(productUpdateSchema);

// Cart validation schemas
const cartItemSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().integer().min(1).max(100).default(1)
});

const cartUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(100).required()
});

// Cart validation middleware
const validateCartItem = validate(cartItemSchema);
const validateCartUpdate = validate(cartUpdateSchema);

// Order validation schemas
const shippingAddressSchema = Joi.object({
  street: Joi.string().trim().required().max(200),
  city: Joi.string().trim().required().max(100),
  state: Joi.string().trim().required().max(100),
  pincode: Joi.string().trim().required().pattern(/^\d{6}$/),
  phone: Joi.string().trim().required().pattern(/^[6-9]\d{9}$/)
});

const orderSchema = Joi.object({
  shippingAddress: shippingAddressSchema.required(),
  paymentMethod: Joi.string().valid('cod', 'razorpay', 'stripe').default('cod'),
  notes: Joi.string().trim().max(500).optional()
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('placed', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  notes: Joi.string().trim().max(500).optional(),
  trackingNumber: Joi.string().trim().optional()
});

const orderCancelSchema = Joi.object({
  reason: Joi.string().trim().required().max(200)
});

// Order validation middleware
const validateOrder = validate(orderSchema);
const validateOrderStatus = validate(orderStatusSchema);
const validateOrderCancel = validate(orderCancelSchema);

module.exports = { 
  validate, 
  validateProduct,
  validateProductUpdate,
  validateCartItem,
  validateCartUpdate,
  validateOrder,
  validateOrderStatus,
  validateOrderCancel
};