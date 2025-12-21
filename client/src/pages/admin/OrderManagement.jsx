import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const OrderManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    paymentStatus: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, user, navigate, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/admin/orders?${params}`);
      const { orders, pagination } = response.data.data;
      
      setOrders(orders);
      setPagination(pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}`);
      setSelectedOrder(response.data.data.order);
      setShowOrderDetail(true);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId, newStatus, notes = '', trackingNumber = '') => {
    try {
      setUpdatingStatus(true);
      await api.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
        notes,
        trackingNumber
      });
      
      // Refresh orders
      fetchOrders();
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === orderId) {
        fetchOrderDetail(orderId);
      }
      
      alert('Order status updated successfully');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  if (loading && orders.length === 0) {
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
                Order Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Track and manage customer orders
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

        {/* Filters */}
        <div className="neu-flat dark:glass-prism p-6 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Search Orders
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Order number or customer name..."
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="totalAmount-desc">Highest Amount</option>
                <option value="totalAmount-asc">Lowest Amount</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchOrders}
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

        {/* Orders Table */}
        <div className="neu-flat dark:glass-prism rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Orders ({pagination.totalItems || 0})
            </h3>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Order #
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Customer
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Order Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Payment
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-800 dark:text-white">
                          {order.orderNumber}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {order.customerId?.firstName} {order.customerId?.lastName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {order.customerId?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchOrderDetail(order._id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                            <div className="relative group">
                              <button className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
                                <div className="space-y-1">
                                  {order.orderStatus === 'placed' && (
                                    <button
                                      onClick={() => updateOrderStatus(order._id, 'processing')}
                                      disabled={updatingStatus}
                                      className="block w-full text-left px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                    >
                                      Mark Processing
                                    </button>
                                  )}
                                  {(order.orderStatus === 'placed' || order.orderStatus === 'processing') && (
                                    <button
                                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                                      disabled={updatingStatus}
                                      className="block w-full text-left px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                    >
                                      Mark Shipped
                                    </button>
                                  )}
                                  {order.orderStatus === 'shipped' && (
                                    <button
                                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                                      disabled={updatingStatus}
                                      className="block w-full text-left px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    disabled={updatingStatus}
                                    className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                  >
                                    Cancel Order
                                  </button>
                                </div>
                              </div>
                            </div>
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
                receipt_long
              </span>
              <p className="text-slate-500 dark:text-slate-400 mb-2">No orders found</p>
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

        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="neu-flat dark:glass-prism rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    Order Details - {selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customerId?.firstName} {selectedOrder.customerId?.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customerId?.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customerId?.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </p>
                      <p><span className="font-medium">Payment:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </p>
                      <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Shipping Address</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
                    <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Order Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          <th className="text-left py-2 px-3">Product</th>
                          <th className="text-left py-2 px-3">Price</th>
                          <th className="text-left py-2 px-3">Quantity</th>
                          <th className="text-left py-2 px-3">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3">₹{item.price.toLocaleString()}</td>
                            <td className="py-2 px-3">{item.quantity}</td>
                            <td className="py-2 px-3">₹{item.subtotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          <td colSpan="3" className="py-2 px-3 font-semibold text-right">Total:</td>
                          <td className="py-2 px-3 font-semibold">₹{selectedOrder.totalAmount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;