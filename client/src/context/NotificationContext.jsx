import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/ToastContainer';

const NotificationContext = createContext();

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50) // Keep last 50
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true }))
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    case 'UPDATE_STOCK':
      return {
        ...state,
        stockUpdates: {
          ...state.stockUpdates,
          [action.payload.productId]: action.payload.stock
        }
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  stockUpdates: {}
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect(user);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Set up socket event listeners
  useEffect(() => {
    // Stock update handler
    const handleStockUpdate = (data) => {
      dispatch({
        type: 'UPDATE_STOCK',
        payload: data
      });

      // Show toast for low stock
      if (data.stock.isLowStock) {
        showInfo(`Stock is running low for this product`);
      }
    };

    // Order update handler
    const handleOrderUpdate = (data) => {
      const notification = {
        id: `order_${data.order._id}_${Date.now()}`,
        type: 'order_update',
        title: 'Order Status Updated',
        message: `Order ${data.order.orderNumber} is now ${data.order.orderStatus}`,
        timestamp: new Date(data.timestamp),
        read: false,
        data: data.order
      };

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: notification
      });

      showSuccess(`Order ${data.order.orderNumber} status updated to ${data.order.orderStatus}`);
    };

    // Low stock alert handler (admin only)
    const handleLowStockAlert = (data) => {
      if (user?.role === 'admin') {
        const notification = {
          id: `low_stock_${data.product._id}_${Date.now()}`,
          type: 'low_stock_alert',
          title: 'Low Stock Alert',
          message: `${data.product.name} is running low (${data.product.stock.quantity} left)`,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.product
        };

        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: notification
        });

        showError(`Low stock alert: ${data.product.name}`);
      }
    };

    // New order handler (admin only)
    const handleNewOrder = (data) => {
      if (user?.role === 'admin') {
        const notification = {
          id: `new_order_${data.order._id}_${Date.now()}`,
          type: 'new_order',
          title: 'New Order Received',
          message: `New order ${data.order.orderNumber} from ${data.order.customerName} - ₹${data.order.totalAmount}`,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.order
        };

        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: notification
        });

        showSuccess(`New order received: ${data.order.orderNumber}`);
      }
    };

    // Cart sync handler
    const handleCartSync = (data) => {
      // This could be used to sync cart across multiple devices
      console.log('Cart sync received:', data);
    };

    // Subscribe to socket events
    socketService.on('stock_update', handleStockUpdate);
    socketService.on('order_update', handleOrderUpdate);
    socketService.on('low_stock_alert', handleLowStockAlert);
    socketService.on('new_order', handleNewOrder);
    socketService.on('cart_sync', handleCartSync);

    // Cleanup
    return () => {
      socketService.off('stock_update', handleStockUpdate);
      socketService.off('order_update', handleOrderUpdate);
      socketService.off('low_stock_alert', handleLowStockAlert);
      socketService.off('new_order', handleNewOrder);
      socketService.off('cart_sync', handleCartSync);
    };
  }, [user, showSuccess, showError, showInfo]);

  // Add notification manually
  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `manual_${Date.now()}`,
        timestamp: new Date(),
        read: false,
        ...notification
      }
    });
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    dispatch({
      type: 'MARK_READ',
      payload: notificationId
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: notificationId
    });
  };

  // Clear all notifications
  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  // Get unread count
  const getUnreadCount = () => {
    return state.notifications.filter(notif => !notif.read).length;
  };

  // Get stock update for product
  const getStockUpdate = (productId) => {
    return state.stockUpdates[productId] || null;
  };

  // Join product room for stock updates
  const subscribeToProduct = (productId) => {
    socketService.joinProduct(productId);
  };

  // Leave product room
  const unsubscribeFromProduct = (productId) => {
    socketService.leaveProduct(productId);
  };

  const value = {
    notifications: state.notifications,
    stockUpdates: state.stockUpdates,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnreadCount,
    getStockUpdate,
    subscribeToProduct,
    unsubscribeFromProduct,
    isConnected: socketService.getConnectionStatus()
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;