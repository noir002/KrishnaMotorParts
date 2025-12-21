import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  // Initialize socket connection
  connect(user = null) {
    if (this.socket) {
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();

    // Authenticate user if provided
    if (user) {
      this.authenticateUser(user);
    }
  }

  // Set up socket event handlers
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    // Handle stock updates
    this.socket.on('stock_update', (data) => {
      console.log('Stock update received:', data);
      this.handleEvent('stock_update', data);
    });

    // Handle order updates
    this.socket.on('order_update', (data) => {
      console.log('Order update received:', data);
      this.handleEvent('order_update', data);
    });

    // Handle low stock alerts (admin)
    this.socket.on('low_stock_alert', (data) => {
      console.log('Low stock alert received:', data);
      this.handleEvent('low_stock_alert', data);
    });

    // Handle new order notifications (admin)
    this.socket.on('new_order', (data) => {
      console.log('New order notification received:', data);
      this.handleEvent('new_order', data);
    });

    // Handle cart sync
    this.socket.on('cart_sync', (data) => {
      console.log('Cart sync received:', data);
      this.handleEvent('cart_sync', data);
    });
  }

  // Authenticate user with server
  authenticateUser(user) {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', {
        userId: user._id,
        role: user.role
      });
    }
  }

  // Join product room for stock updates
  joinProduct(productId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_product', productId);
    }
  }

  // Leave product room
  leaveProduct(productId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_product', productId);
    }
  }

  // Subscribe to events
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Unsubscribe from events
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Handle incoming events
  handleEvent(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error handling ${event} event:`, error);
        }
      });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;