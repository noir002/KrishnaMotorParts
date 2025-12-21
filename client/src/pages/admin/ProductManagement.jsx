import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const ProductManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    lowStock: false
  });
  const [categories, setCategories] = useState([]);
  const [editingStock, setEditingStock] = useState({});

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchProducts();
    fetchCategories();
  }, [isAuthenticated, user, navigate, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/admin/inventory/report?${params}`);
      const { products, summary, pagination } = response.data.data;
      
      setProducts(products);
      setSummary(summary);
      setPagination(pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleStockUpdate = async (productId, newQuantity, lowStockThreshold) => {
    try {
      await api.put(`/api/admin/inventory/stock/${productId}`, {
        quantity: parseInt(newQuantity),
        lowStockThreshold: parseInt(lowStockThreshold)
      });
      
      // Refresh products
      fetchProducts();
      setEditingStock(prev => ({ ...prev, [productId]: false }));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update stock');
    }
  };

  const toggleStockEdit = (productId) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Product Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Manage your inventory and product catalog
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="neu-btn px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {summary.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                  inventory_2
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary.lowStockItems || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  warning
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {summary.outOfStockItems || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">
                  inventory
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{(summary.totalValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                  currency_rupee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="neu-flat dark:glass-prism p-6 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, part number, or brand..."
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Stock Status
              </label>
              <select
                value={filters.lowStock}
                onChange={(e) => handleFilterChange('lowStock', e.target.value === 'true')}
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                <option value="true">Low Stock Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="w-full neu-btn px-4 py-2 rounded-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">search</span>
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="neu-flat dark:glass-prism p-4 rounded-2xl mb-8 border-l-4 border-red-500">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="neu-flat dark:glass-prism rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Products ({pagination.totalItems || 0})
            </h3>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Product
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Category
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Price
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Stock
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {product.partNumber} • {product.brand}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {product.category?.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        {editingStock[product._id] ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              defaultValue={product.stock.quantity}
                              min="0"
                              className="w-20 px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                              id={`quantity-${product._id}`}
                            />
                            <input
                              type="number"
                              defaultValue={product.stock.lowStockThreshold}
                              min="0"
                              placeholder="Low stock threshold"
                              className="w-20 px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                              id={`threshold-${product._id}`}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {product.stock.quantity}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Threshold: {product.stock.lowStockThreshold}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock.quantity === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : product.stock.quantity <= product.stock.lowStockThreshold
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {product.stock.quantity === 0
                            ? 'Out of Stock'
                            : product.stock.quantity <= product.stock.lowStockThreshold
                            ? 'Low Stock'
                            : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          {editingStock[product._id] ? (
                            <>
                              <button
                                onClick={() => {
                                  const quantity = document.getElementById(`quantity-${product._id}`).value;
                                  const threshold = document.getElementById(`threshold-${product._id}`).value;
                                  handleStockUpdate(product._id, quantity, threshold);
                                }}
                                className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                title="Save"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                              </button>
                              <button
                                onClick={() => toggleStockEdit(product._id)}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                title="Cancel"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleStockEdit(product._id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                              title="Edit Stock"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600 mb-4">
                inventory_2
              </span>
              <p className="text-slate-500 dark:text-slate-400 mb-2">No products found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Try adjusting your search filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => handleFilterChange('page', page)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;