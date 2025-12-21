const Joi = require('joi');

// Common validation schemas
const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId format');

const emailSchema = Joi.string().email().required();

const passwordSchema = Joi.string().min(6).max(128).required();

const phoneSchema = Joi.string().regex(/^[6-9]\d{9}$/).message('Phone number must be a valid 10-digit Indian phone number starting with 6-9');

const priceSchema = Joi.number().positive().precision(2);

// User validation schemas
const userRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.required(),
  role: Joi.string().valid('customer', 'admin').default('customer')
});

const userLoginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required()
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: objectIdSchema.required(),
  subcategory: Joi.string().max(100),
  price: priceSchema.required(),
  discountPrice: priceSchema.allow(null),
  brand: Joi.string().min(2).max(100).required(),
  partNumber: Joi.string().max(100),
  compatibility: Joi.array().items(
    Joi.object({
      make: Joi.string().required(),
      model: Joi.string().required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 2)
    })
  ),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()),
  images: Joi.array().items(Joi.string().uri()),
  stock: Joi.object({
    quantity: Joi.number().integer().min(0).required(),
    lowStockThreshold: Joi.number().integer().min(0).default(10),
    inStock: Joi.boolean().default(true)
  }).required(),
  tags: Joi.array().items(Joi.string().max(50)),
  isActive: Joi.boolean().default(true)
});

// Order validation schemas
const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: objectIdSchema.required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().regex(/^[0-9]{6}$/).required(),
    phone: phoneSchema.required()
  }).required(),
  paymentMethod: Joi.string().valid('cod', 'razorpay', 'stripe').default('cod')
});

module.exports = {
  objectIdSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  priceSchema,
  userRegistrationSchema,
  userLoginSchema,
  productSchema,
  orderSchema
};