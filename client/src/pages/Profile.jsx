import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

// Order History Component
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/api/orders', { params });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch order details');
    }
  };

  const cancelOrder = async (orderId, reason = 'Customer request') => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await api.put(`/api/orders/${orderId}/cancel`, { reason });
      if (response.data.success) {
        fetchOrders(); // Refresh orders list
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.data.order);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="neu-flat p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 dark:text-gray-300">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="neu-flat p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Order History
          </h2>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option value="">All Orders</option>
              <option value="placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-slate-600 dark:text-gray-300">
              {statusFilter ? `No orders with status "${statusFilter}"` : 'You haven\'t placed any orders yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Order #{order.orderNumber}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatCurrency(order.totalAmount)}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fetchOrderDetails(order._id)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                      {(order.orderStatus === 'placed' || order.orderStatus === 'processing') && (
                        <Button
                          onClick={() => cancelOrder(order._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-slate-600 dark:text-gray-300">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Order Details - #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Status and Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-300">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-300">Order Date:</span>
                      <span className="text-slate-800 dark:text-white">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-gray-300">Payment Method:</span>
                      <span className="text-slate-800 dark:text-white">{selectedOrder.paymentMethod.toUpperCase()}</span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-gray-300">Tracking Number:</span>
                        <span className="text-blue-600 dark:text-blue-400">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Shipping Address</h4>
                  <div className="text-sm text-slate-600 dark:text-gray-300">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>{selectedOrder.shippingAddress.pincode}</p>
                    {selectedOrder.shippingAddress.phone && (
                      <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {item.productId?.images?.[0] && (
                        <img
                          src={item.productId.images[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-800 dark:text-white">{item.name}</h5>
                        {item.productId?.brand && (
                          <p className="text-sm text-slate-600 dark:text-gray-300">Brand: {item.productId.brand}</p>
                        )}
                        {item.productId?.partNumber && (
                          <p className="text-sm text-slate-600 dark:text-gray-300">Part #: {item.productId.partNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800 dark:text-white">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-300">
                          Subtotal: {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-800 dark:text-white">Total Amount:</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {(selectedOrder.orderStatus === 'placed' || selectedOrder.orderStatus === 'processing') && (
                  <Button
                    onClick={() => {
                      cancelOrder(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let response;
      if (editingAddress !== null) {
        // Update existing address
        response = await api.put(`/api/auth/addresses/${editingAddress}`, addressForm);
      } else {
        // Add new address
        response = await api.post('/api/auth/addresses', addressForm);
      }

      if (response.data.success) {
        setAddresses(response.data.data.user.addresses);
        setMessage(editingAddress !== null ? 'Address updated successfully!' : 'Address added successfully!');
        resetAddressForm();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.delete(`/api/auth/addresses/${index}`);
      if (response.data.success) {
        setAddresses(response.data.data.user.addresses);
        setMessage('Address deleted successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (index) => {
    const address = addresses[index];
    setAddressForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingAddress(index);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8">
            Profile
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8">
          My Profile
        </h1>

        {/* Tab Navigation */}
        <div className="neu-flat mb-8">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'addresses'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Order History
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="neu-flat p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Enter 10-digit phone number"
                pattern="[6-9][0-9]{9}"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Update Profile'}
              </Button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="neu-flat p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Saved Addresses
                </h2>
                <Button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add New Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-slate-600 dark:text-gray-300 text-center py-8">
                  No addresses saved yet. Add your first address to get started.
                </p>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {address.type.toUpperCase()}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 dark:text-white font-medium">
                            {address.street}
                          </p>
                          <p className="text-slate-600 dark:text-gray-300">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="neu-flat p-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  {editingAddress !== null ? 'Edit Address' : 'Add New Address'}
                </h3>
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
                        Address Type
                      </label>
                      <select
                        value={addressForm.type}
                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">
                          Set as default address
                        </span>
                      </label>
                    </div>
                  </div>
                  <Input
                    label="Street Address"
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="Enter complete street address"
                    required
                  />
                  <div className="grid md:grid-cols-3 gap-6">
                    <Input
                      label="City"
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State"
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                    <Input
                      label="Pincode"
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : (editingAddress !== null ? 'Update Address' : 'Add Address')}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetAddressForm}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'orders' && (
          <OrderHistory />
        )}
      </div>
    </div>
  );
};

export default Profile;