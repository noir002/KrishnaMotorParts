const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message,
        details: {}
      }
    };
    return res.status(404).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      error: {
        code: 'DUPLICATE_FIELD',
        message,
        details: {}
      }
    };
    return res.status(400).json(error);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: {}
      }
    };
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message,
        details: {}
      }
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message,
        details: {}
      }
    };
    return res.status(401).json(error);
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: error.message || 'Server Error',
      details: {}
    }
  });
};

module.exports = errorHandler;