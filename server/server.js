require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/utils/database');
const socketService = require('./src/services/socketService');
const cacheService = require('./src/services/cacheService');

const PORT = process.env.PORT || 5001;

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;