import api from './api';

// Order service for all order-related API calls
class OrderService {
  // Create a new order
  async createOrder(orderData) {
    try {
      const response = await api.post('/api/orders', orderData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Order creation error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create order',
        details: error.response?.data?.error?.details || {},
        status: error.response?.status
      };
    }
  }

  // Get user's orders with pagination and filters
  async getUserOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/orders?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data?.orders || [],
        pagination: response.data.data?.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch orders',
        status: error.response?.status
      };
    }
  }

  // Get single order by ID
  async getOrder(orderId) {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return {
        success: true,
        data: response.data.data?.order || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch order',
        status: error.response?.status
      };
    }
  }

  // Cancel an order
  async cancelOrder(orderId, reason = 'Customer request') {
    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data?.order || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to cancel order',
        status: error.response?.status
      };
    }
  }

  // Track order status
  async trackOrder(orderId) {
    try {
      const response = await api.get(`/api/orders/${orderId}/track`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to track order',
        status: error.response?.status
      };
    }
  }
}

export default new OrderService();