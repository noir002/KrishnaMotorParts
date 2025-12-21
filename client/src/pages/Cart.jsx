import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Cart = () => {
  const { items, loading, error, clearCart, clearError } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4 lg:mb-0">
            Shopping Cart
          </h1>
          
          {items.length > 0 && (
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Clear Cart
              </Button>
              <Button
                variant="secondary"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button
                variant="ghost"
                size="small"
                onClick={clearError}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="neu-flat p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Your cart is empty
              </h2>
              <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
                Start shopping to add items to your cart!
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={handleContinueShopping}
              >
                Start Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <p className="text-lg text-slate-600 dark:text-gray-300">
                  {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </p>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;