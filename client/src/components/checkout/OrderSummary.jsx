import React from 'react';
import { useCart } from '../../context/CartContext';
import Card from '../common/Card';

const OrderSummary = () => {
  const { items, getCartTotals } = useCart();
  const { subtotal, itemCount } = getCartTotals();

  // Calculate costs (same logic as CartSummary)
  const shippingCost = parseFloat(subtotal) > 500 ? 0 : 50;
  const taxRate = 0.18;
  const taxAmount = parseFloat(subtotal) * taxRate;
  const totalAmount = parseFloat(subtotal) + shippingCost + taxAmount;

  return (
    <Card className="sticky top-24">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Order Summary
      </h2>

      {/* Order Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <img
              src={item.image || '/placeholder-product.jpg'}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg neu-pressed flex-shrink-0"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
            <div className="flex-grow min-w-0">
              <h4 className="font-medium text-slate-800 dark:text-white text-sm truncate">
                {item.name}
              </h4>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
              </p>
              <p className="text-primary font-semibold text-sm">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-slate-300 dark:border-gray-600 mb-4" />

      {/* Cost Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-slate-600 dark:text-gray-300">
          <span>Subtotal ({itemCount} items)</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-gray-300">
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? (
              <span className="text-green-600 dark:text-green-400">FREE</span>
            ) : (
              `₹${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-gray-300">
          <span>Tax (GST 18%)</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>

        <hr className="border-slate-300 dark:border-gray-600" />

        <div className="flex justify-between text-xl font-bold text-slate-800 dark:text-white">
          <span>Total</span>
          <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="text-green-600 dark:text-green-400">🔒</div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your order is secured with SSL encryption
          </p>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;