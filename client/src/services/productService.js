import api from './api';

// Product service for all product-related API calls
class ProductService {
  // Get all products with filters, search, and pagination
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all provided parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/products?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.data?.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch products',
        status: error.response?.status
      };
    }
  }

  // Get single product by ID
  async getProduct(productId) {
    try {
      const response = await api.get(`/api/products/${productId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch product',
        status: error.response?.status
      };
    }
  }

  // Get related products
  async getRelatedProducts(productId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('exclude', productId);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/products/related/${productId}?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data?.products || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch related products',
        status: error.response?.status
      };
    }
  }

  // Get product categories
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch categories',
        status: error.response?.status
      };
    }
  }

  // Get unique brands
  async getBrands() {
    try {
      const response = await api.get('/api/products/brands');
      return {
        success: true,
        data: response.data.data?.brands || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch brands',
        status: error.response?.status
      };
    }
  }

  // Search products
  async searchProducts(query, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/api/products?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data?.products || [],
        pagination: response.data.data?.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to search products',
        status: error.response?.status
      };
    }
  }
}

export default new ProductService();