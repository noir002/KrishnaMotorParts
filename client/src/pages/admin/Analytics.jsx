import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const Analytics = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [period, setPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    orders: null,
    sales: null,
    customers: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchAnalyticsData();
  }, [isAuthenticated, user, navigate, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, salesResponse, customersResponse] = await Promise.all([
        api.get(`/api/admin/analytics/orders?period=${period}`),
        api.get(`/api/admin/analytics/sales?period=${period}`),
        api.get(`/api/admin/analytics/customers?period=${period}`)
      ]);

      setAnalyticsData({
        orders: ordersResponse.data.data,
        sales: salesResponse.data.data,
        customers: customersResponse.data.data
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const { orders, sales, customers } = analyticsData;

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Analytics & Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Business insights and performance metrics
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

        {/* Period Selector */}
        <div className="neu-flat dark:glass-prism p-6 rounded-2xl mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Time Period:
            </label>
            <div className="flex space-x-2">
              {[
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' },
                { value: '1y', label: '1 Year' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    period === option.value
                      ? 'bg-blue-600 text-white'
                      : 'neu-btn'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="neu-flat dark:glass-prism p-4 rounded-2xl mb-8 border-l-4 border-red-500">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="neu-flat dark:glass-prism rounded-2xl mb-8">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { id: 'orders', label: 'Order Analytics', icon: 'receipt_long' },
              { id: 'sales', label: 'Sales Reports', icon: 'trending_up' },
              { id: 'customers', label: 'Customer Insights', icon: 'people' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Order Analytics Tab */}
            {activeTab === 'orders' && orders && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {orders.overview.totalOrders}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                        shopping_cart
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {formatCurrency(orders.overview.totalRevenue)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                        currency_rupee
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Avg Order Value</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {formatCurrency(orders.overview.averageOrderValue)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                        analytics
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Completed Orders</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {orders.overview.completedOrders}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                        check_circle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Order Status Distribution
                    </h3>
                    <div className="space-y-3">
                      {orders.statusDistribution.map((status) => (
                        <div key={status._id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status._id === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              status._id === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              status._id === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {status._id}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {status.count} orders
                            </span>
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(status.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Daily Order Trends
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {orders.dailyTrends.map((day) => (
                        <div key={day._id} className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(day._id)}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                              {day.orders} orders
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatCurrency(day.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Reports Tab */}
            {activeTab === 'sales' && sales && (
              <div className="space-y-6">
                {/* Sales Trends */}
                <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    Sales Trends
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sales.salesTrends.map((trend) => (
                      <div key={trend._id} className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(trend._id)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-800 dark:text-white">
                            {formatCurrency(trend.revenue)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {trend.orders} orders • Avg: {formatCurrency(trend.averageOrderValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products and Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Top Products
                    </h3>
                    <div className="space-y-3">
                      {sales.topProducts.map((product, index) => (
                        <div key={product._id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Qty: {product.totalQuantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(product.totalRevenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Top Categories
                    </h3>
                    <div className="space-y-3">
                      {sales.topCategories.map((category, index) => (
                        <div key={category._id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">
                                {category.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Qty: {category.totalQuantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(category.totalRevenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Insights Tab */}
            {activeTab === 'customers' && customers && (
              <div className="space-y-6">
                {/* Customer Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Total Customers</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {customers.overview.totalCustomers}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                        people
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Active Customers</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {customers.overview.activeCustomers}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                        person_check
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Avg Orders/Customer</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {customers.overview.averageOrdersPerCustomer.toFixed(1)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                        shopping_bag
                      </span>
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Avg Spent/Customer</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {formatCurrency(customers.overview.averageSpentPerCustomer)}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                        currency_rupee
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Customers and New Customer Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Top Customers
                    </h3>
                    <div className="space-y-3">
                      {customers.topCustomers.map((customer, index) => (
                        <div key={customer._id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {customer.totalOrders} orders
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="neu-flat dark:glass-prism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      New Customer Trends
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {customers.newCustomerTrends.map((trend) => (
                        <div key={trend._id} className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(trend._id)}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-white">
                            {trend.newCustomers} new customers
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;