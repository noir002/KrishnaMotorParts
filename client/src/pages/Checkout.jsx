import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../components/common/ToastContainer';
import DeliveryForm from '../components/checkout/DeliveryForm';
import PaymentMethod from '../components/checkout/PaymentMethod';
import OrderSummary from '../components/checkout/OrderSummary';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { items, getCartTotals, clearCart } = useCart();
  const navigate = useNavigate();
  const { handleApiResponse } = useErrorHandler();
  const { loading, withLoading } = useLoading(false);
  const { showSuccess, showError } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [error, setError] = useState(null);

  const { itemCount, subtotal } = getCartTotals();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
              Login Required
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
              Please log in to proceed with checkout.
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/login', { state: { from: '/checkout' } })}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
              Cart is Empty
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
              Add some items to your cart before checking out.
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeliverySubmit = (formData) => {
    setDeliveryInfo(formData);
    setCurrentStep(2);
    setError(null);
  };

  const handlePaymentSubmit = async (paymentMethod) => {
    await withLoading(async () => {
      setError(null);

      try {
        // Prepare order data - only send what the validation expects
        const orderData = {
          shippingAddress: {
            street: deliveryInfo.street?.trim(),
            city: deliveryInfo.city?.trim(),
            state: deliveryInfo.state?.trim(),
            pincode: deliveryInfo.pincode?.trim(),
            phone: deliveryInfo.phone?.replace(/\D/g, '')?.substring(0, 10) // Clean and limit to 10 digits
          },
          paymentMethod
        };

        // Create order
        const response = await orderService.createOrder(orderData);
        const result = handleApiResponse(response, 'creating order');
        
        if (result.success) {
          // Clear cart after successful order
          await clearCart();
          
          showSuccess('Order placed successfully!');
          
          // Redirect to confirmation page with the correct order ID
          const orderId = result.data.order?._id || result.data._id;
          navigate(`/order-confirmation/${orderId}`);
        } else {
          let errorMessage = result.error;
          
          // Show detailed validation errors if available
          if (result.details?.errors) {
            const validationErrors = result.details.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          }
          
          setError(errorMessage);
          showError(errorMessage);
        }
      } catch (error) {
        console.error('Error creating order:', error);
        setError('Failed to place order. Please try again.');
        showError('Failed to place order. Please try again.');
      }
    });
  };

  const handleBackToDelivery = () => {
    setCurrentStep(1);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-lg text-slate-600 dark:text-gray-300 mt-4">
            Processing your order...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8">
          Checkout
        </h1>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-slate-300 dark:bg-gray-600 text-slate-600 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              currentStep >= 2 ? 'bg-primary' : 'bg-slate-300 dark:bg-gray-600'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-slate-300 dark:bg-gray-600 text-slate-600 dark:text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <p className="text-slate-600 dark:text-gray-300">
            Step {currentStep} of 2: {currentStep === 1 ? 'Delivery Information' : 'Payment Method'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <DeliveryForm 
                onSubmit={handleDeliverySubmit}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                <PaymentMethod 
                  onSubmit={handlePaymentSubmit}
                  loading={loading}
                />
                <Button
                  variant="ghost"
                  onClick={handleBackToDelivery}
                  disabled={loading}
                >
                  ← Back to Delivery Information
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;