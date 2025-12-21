import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

const PaymentMethod = ({ onSubmit, loading }) => {
  const [selectedMethod, setSelectedMethod] = useState('cod');

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: '💵',
      available: true
    },
    {
      id: 'razorpay',
      name: 'Online Payment',
      description: 'Pay securely with card/UPI/wallet',
      icon: '💳',
      available: false, // Will be enabled in future updates
      comingSoon: true
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedMethod);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Payment Method
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedMethod === method.id && method.available
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500'
                }
                ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => method.available && setSelectedMethod(method.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{method.icon}</div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {method.name}
                    </h3>
                    {method.comingSoon && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-gray-400 text-sm">
                    {method.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => method.available && setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className="w-5 h-5 text-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedMethod === 'cod' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Cash on Delivery
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Please keep the exact amount ready. Our delivery partner will collect the payment when your order arrives.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="w-full"
          >
            Place Order
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PaymentMethod;