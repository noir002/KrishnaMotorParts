import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${orderId}`);
        // Handle the API response structure: { success: true, data: { order: ... } }
        const orderData = response.data.data?.order || response.data;
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <Card className="p-12">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Order Not Found
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
              {error || 'The order you are looking for could not be found.'}
            </p>
            <Button variant="primary" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <Card className="p-12">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-300 mb-2">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <p className="text-primary font-bold text-xl">
              Order #{order.orderNumber}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Order Details
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-gray-300">Order Number:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-gray-300">Order Date:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-gray-300">Status:</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-gray-300">Payment Method:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-slate-800 dark:text-white">Total Amount:</span>
                <span className="text-primary">₹{(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-slate-300 dark:border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Items Ordered ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        Qty: {item.quantity} × ₹{(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      ₹{(item.subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Delivery Information */}
          <Card>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Delivery Information
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                  Delivery Address:
                </h3>
                <div className="text-slate-600 dark:text-gray-300">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.pincode}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  What's Next?
                </h4>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• We'll process your order within 24 hours</li>
                  <li>• You'll receive tracking information via email</li>
                  <li>• Expected delivery: 3-5 business days</li>
                  <li>• Keep the exact amount ready for COD orders</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            variant="primary"
            size="large"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={handleViewOrders}
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;