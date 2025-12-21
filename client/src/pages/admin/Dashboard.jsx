import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/dashboard/stats');
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="neu-btn px-6 py-2 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, orders, recentOrders } = dashboardData || {};

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Welcome back, {user?.firstName}! Here's your business overview.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {overview?.totalProducts || 0}
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
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {overview?.totalCustomers || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                  people
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {overview?.totalOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                  shopping_cart
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  ₹{(overview?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                  currency_rupee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Order Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Pending</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {orders?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">This Week</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {orders?.weekly || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">This Month</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {orders?.monthly || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Inventory Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Low Stock Items</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {overview?.lowStockCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Monthly Revenue</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₹{(overview?.monthlyRevenue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/products')}
                className="w-full neu-btn px-4 py-2 rounded-full text-left flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">inventory</span>
                <span>Manage Products</span>
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full neu-btn px-4 py-2 rounded-full text-left flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                <span>View Orders</span>
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="w-full neu-btn px-4 py-2 rounded-full text-left flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="neu-flat dark:glass-prism p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Recent Orders
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="neu-btn px-4 py-2 rounded-full text-sm"
            >
              View All
            </button>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      Order #
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {order.customerId?.firstName} {order.customerId?.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.orderStatus === 'delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : order.orderStatus === 'processing'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : order.orderStatus === 'shipped'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600 mb-2">
                receipt_long
              </span>
              <p className="text-slate-500 dark:text-slate-400">No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;