import React from 'react';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';
import Card from '../common/Card';

const CartSummary = ({ onCheckout }) => {
  const { getCartTotals } = useCart();
  const { subtotal, itemCount } = getCartTotals();

  // Calculate additional costs (can be made configurable later)
  const shippingCost = parseFloat(subtotal) > 500 ? 0 : 50; // Free shipping over ₹500
  const taxRate = 0.18; // 18% GST
  const taxAmount = (parseFloat(subtotal) * taxRate);
  const totalAmount = parseFloat(subtotal) + shippingCost + taxAmount;

  return (
    <Card className="sticky top-24">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-slate-600 dark:text-gray-300">
          <span>Items ({itemCount})</span>
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

      {parseFloat(subtotal) > 0 && (
        <>
          {shippingCost > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Add ₹{(500 - parseFloat(subtotal)).toFixed(2)} more for FREE shipping!
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="large"
            onClick={onCheckout}
            className="w-full"
          >
            Proceed to Checkout
          </Button>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Secure checkout with SSL encryption
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

export default CartSummary;