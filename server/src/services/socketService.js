const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  // Initialize Socket.IO server
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:3000',
          'http://localhost:3000',
          'http://localhost:5173'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('Socket.IO server initialized');
  }

  // Set up event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        if (data.userId) {
          this.connectedUsers.set(data.userId, socket.id);
          socket.userId = data.userId;
          socket.join(`user_${data.userId}`);
          console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
        }

        if (data.role === 'admin') {
          socket.join('admin');
          console.log(`Admin user joined admin room: ${socket.id}`);
        }
      });

      // Handle joining product rooms for stock updates
      socket.on('join_product', (productId) => {
        socket.join(`product_${productId}`);
        console.log(`Socket ${socket.id} joined product room: ${productId}`);
      });

      // Handle leaving product rooms
      socket.on('leave_product', (productId) => {
        socket.leave(`product_${productId}`);
        console.log(`Socket ${socket.id} left product room: ${productId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected: ${socket.id}`);
        } else {
          console.log(`User disconnected: ${socket.id}`);
        }
      });
    });
  }

  // Emit stock update to all clients viewing a product
  emitStockUpdate(productId, stockData) {
    if (this.io) {
      this.io.to(`product_${productId}`).emit('stock_update', {
        productId,
        stock: stockData,
        timestamp: new Date().toISOString()
      });
      console.log(`Stock update emitted for product ${productId}:`, stockData);
    }
  }

  // Emit order status update to specific user
  emitOrderUpdate(userId, orderData) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('order_update', {
        order: orderData,
        timestamp: new Date().toISOString()
      });
      console.log(`Order update emitted to user ${userId}:`, orderData.orderNumber);
    }
  }

  // Emit low stock alert to admin users
  emitLowStockAlert(productData) {
    if (this.io) {
      this.io.to('admin').emit('low_stock_alert', {
        product: productData,
        timestamp: new Date().toISOString()
      });
      console.log(`Low stock alert emitted for product:`, productData.name);
    }
  }

  // Emit new order notification to admin users
  emitNewOrderNotification(orderData) {
    if (this.io) {
      this.io.to('admin').emit('new_order', {
        order: orderData,
        timestamp: new Date().toISOString()
      });
      console.log(`New order notification emitted:`, orderData.orderNumber);
    }
  }

  // Emit cart sync to user (for multi-device sync)
  emitCartSync(userId, cartData) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('cart_sync', {
        cart: cartData,
        timestamp: new Date().toISOString()
      });
      console.log(`Cart sync emitted to user ${userId}`);
    }
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get socket instance for middleware use
  getIO() {
    return this.io;
  }
}

module.exports = new SocketService();