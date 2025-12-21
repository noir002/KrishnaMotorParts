import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateCartItem(item.productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <div className="neu-flat p-6 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image || '/placeholder-product.jpg'}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg neu-pressed"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {item.name}
          </h3>
          <p className="text-primary font-bold text-xl mb-2">
            ₹{item.price.toFixed(2)}
          </p>
          
          {/* Stock Status */}
          {item.stock > 0 ? (
            <p className="text-green-600 dark:text-green-400 text-sm">
              In Stock ({item.stock} available)
            </p>
          ) : (
            <p className="text-red-600 dark:text-red-400 text-sm">
              Out of Stock
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="w-10 h-10 rounded-full p-0"
            >
              -
            </Button>
            
            <span className="text-lg font-bold text-slate-800 dark:text-white min-w-[3rem] text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className="w-10 h-10 rounded-full p-0"
            >
              +
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-primary">₹{itemTotal}</p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="small"
            onClick={handleRemove}
            disabled={isRemoving}
            loading={isRemoving}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;