const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { performanceMonitor, startMemoryMonitoring } = require('./middleware/performance');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Performance monitoring
app.use(performanceMonitor);

// Start memory monitoring
startMemoryMonitoring();

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const cacheService = require('./services/cacheService');
  const socketService = require('./services/socketService');
  const { memoryMonitor } = require('./middleware/performance');
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: memoryMonitor(),
    services: {
      database: 'connected', // This could be enhanced to actually check DB connection
      cache: await cacheService.healthCheck(),
      websocket: {
        status: socketService.getIO() ? 'active' : 'inactive',
        connectedUsers: socketService.getConnectedUsersCount()
      }
    }
  };
  
  res.status(200).json({
    success: true,
    data: health
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/newsletter', require('./routes/newsletter'));

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;