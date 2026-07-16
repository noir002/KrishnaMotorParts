require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/utils/database');
const socketService = require('./src/services/socketService');
const cacheService = require('./src/services/cacheService');
const AbandonedCartScheduler = require('./src/services/abandonedCartScheduler');
const notificationService = require('./src/services/notificationService');

const PORT = process.env.PORT || 5001;

// Initialize abandoned cart scheduler
let abandonedCartScheduler = null;

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO
socketService.initialize(server);

// Initialize cache service
cacheService.initialize();

// Initialize and start abandoned cart scheduler after database connection
abandonedCartScheduler = new AbandonedCartScheduler(notificationService);
abandonedCartScheduler.start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Stop abandoned cart scheduler
  if (abandonedCartScheduler) {
    abandonedCartScheduler.stop();
  }
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  
  // Stop abandoned cart scheduler
  if (abandonedCartScheduler) {
    abandonedCartScheduler.stop();
  }
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;