import api from './api';

// Cart service for all cart-related API calls
class CartService {
  // Get user's cart
  async getCart() {
    try {
      const response = await api.get('/api/cart');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch cart',
        status: error.response?.status
      };
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post('/api/cart/items', {
        productId,
        quantity
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to add item to cart',
        status: error.response?.status
      };
    }
  }

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    try {
      const response = await api.put(`/api/cart/items/${productId}`, {
        quantity
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to update cart item',
        status: error.response?.status
      };
    }
  }

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await api.delete(`/api/cart/items/${productId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to remove item from cart',
        status: error.response?.status
      };
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await api.delete('/api/cart');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to clear cart',
        status: error.response?.status
      };
    }
  }

  // Sync local cart with server (for when user logs in)
  async syncCart(localCartItems) {
    try {
      const response = await api.post('/api/cart/sync', {
        items: localCartItems
      });
      return {
        success: true,
        data: response.data.data?.items || response.data.items || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to sync cart',
        status: error.response?.status
      };
    }
  }
}

export default new CartService();