import api from './api';

// Admin service for all admin-related API calls
class AdminService {
  // Dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/api/admin/dashboard/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch dashboard stats',
        status: error.response?.status
      };
    }
  }

  // Inventory management
  async getInventoryReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/admin/inventory/report?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch inventory report',
        status: error.response?.status
      };
    }
  }

  // Update product stock
  async updateStock(productId, stockData) {
    try {
      const response = await api.put(`/api/admin/inventory/stock/${productId}`, stockData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update stock',
        status: error.response?.status
      };
    }
  }

  // Order management
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/admin/orders?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch orders',
        status: error.response?.status
      };
    }
  }

  // Get single order details
  async getOrder(orderId) {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch order details',
        status: error.response?.status
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, statusData) {
    try {
      const response = await api.put(`/api/admin/orders/${orderId}/status`, statusData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update order status',
        status: error.response?.status
      };
    }
  }

  // Product management
  async createProduct(productData) {
    try {
      const response = await api.post('/api/admin/products', productData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create product',
        status: error.response?.status
      };
    }
  }

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/api/admin/products/${productId}`, productData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update product',
        status: error.response?.status
      };
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/api/admin/products/${productId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to delete product',
        status: error.response?.status
      };
    }
  }

  // Analytics
  async getAnalytics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/admin/analytics?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch analytics',
        status: error.response?.status
      };
    }
  }
}

export default new AdminService();