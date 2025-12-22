const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { userRegistrationSchema, userLoginSchema } = require('../utils/validators');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = userRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    const { firstName, lastName, email, password, phone, role } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: `User with this ${field} already exists`,
          details: { field }
        }
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role
    });

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          addresses: user.addresses,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    console.log('Login attempt - Request body:', req.body);
    
    // Validate request body
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    const { email, password } = value;
    console.log('Validated credentials:', { email, password: '***' });

    // Check for user and include password field
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', { 
        id: user._id, 
        email: user.email, 
        isActive: user.isActive,
        hasPassword: !!user.password 
      });
    }

    if (!user) {
      console.log('User not found for email:', email.toLowerCase());
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: {}
        }
      });
    }

    // Check password
    console.log('Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password comparison failed');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: {}
        }
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          addresses: user.addresses,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          addresses: user.addresses,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No valid fields provided for update',
          details: { allowedFields }
        }
      });
    }

    // Validate phone if provided
    if (updates.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(updates.phone)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PHONE',
            message: 'Please provide a valid 10-digit Indian phone number',
            details: {}
          }
        });
      }

      // Check if phone already exists for another user
      const existingUser = await User.findOne({ 
        phone: updates.phone,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'PHONE_EXISTS',
            message: 'Phone number already registered with another account',
            details: {}
          }
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          addresses: user.addresses,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address to user profile
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { type, street, city, state, pincode, isDefault } = req.body;

    // Validate required fields
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Street, city, state, and pincode are required',
          details: {}
        }
      });
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PINCODE',
          message: 'Pincode must be 6 digits',
          details: {}
        }
      });
    }

    const addressData = {
      type: type || 'home',
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: Boolean(isDefault)
    };

    await req.user.addAddress(addressData);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          addresses: req.user.addresses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user address
// @route   PUT /api/auth/addresses/:addressIndex
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const addressIndex = parseInt(req.params.addressIndex);
    const { type, street, city, state, pincode, isDefault } = req.body;

    if (isNaN(addressIndex) || addressIndex < 0 || addressIndex >= req.user.addresses.length) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
          details: {}
        }
      });
    }

    // Validate pincode if provided
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PINCODE',
          message: 'Pincode must be 6 digits',
          details: {}
        }
      });
    }

    // Update address fields
    const address = req.user.addresses[addressIndex];
    if (type) address.type = type;
    if (street) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (pincode) address.pincode = pincode.trim();

    // Handle default address logic
    if (isDefault === true) {
      req.user.addresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          addresses: req.user.addresses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user address
// @route   DELETE /api/auth/addresses/:addressIndex
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const addressIndex = parseInt(req.params.addressIndex);

    if (isNaN(addressIndex) || addressIndex < 0 || addressIndex >= req.user.addresses.length) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
          details: {}
        }
      });
    }

    const wasDefault = req.user.addresses[addressIndex].isDefault;
    req.user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are remaining addresses, make first one default
    if (wasDefault && req.user.addresses.length > 0) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          addresses: req.user.addresses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress
};