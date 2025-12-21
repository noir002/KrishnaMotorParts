import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { useRealTimeStock } from '../../hooks/useRealTimeStock';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Use real-time stock updates
  const realtimeStock = useRealTimeStock(product._id, product.stock);
  const currentStock = realtimeStock || product.stock;

  // State for image loading error
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    e.stopPropagation();
    
    const result = await addToCart(product, 1);
    if (result.success) {
      // Could add toast notification here
      console.log('Product added to cart successfully');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = !currentStock?.inStock || currentStock?.quantity <= 0;
  const isLowStock = currentStock?.isLowStock;

  return (
    <Link to={`/products/${product._id}`} className="block group">
      <div className="neu-flat p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
          {product.images && product.images.length > 0 && !imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
              <span className="material-symbols-outlined text-6xl">
                auto_parts
              </span>
            </div>
          )}
          
          {/* Stock Status Badge */}
          {isOutOfStock ? (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Out of Stock
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Low Stock ({currentStock.quantity})
            </div>
          ) : null}
          
          {/* Discount Badge */}
          {product.discountPrice && product.discountPrice < product.price && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {product.subcategory || product.category.name || product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Brand: {product.brand}
            </p>
          )}

          {/* Part Number */}
          {product.partNumber && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Part #: {product.partNumber}
            </p>
          )}

          {/* Compatibility */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>Fits: </span>
              <span className="font-medium">
                {product.compatibility.slice(0, 2).map(comp => 
                  `${comp.make} ${comp.model}`
                ).join(', ')}
                {product.compatibility.length > 2 && ` +${product.compatibility.length - 2} more`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isOutOfStock ? (
              <span className="text-red-500 font-medium">Out of Stock</span>
            ) : product.stock?.quantity <= 5 ? (
              <span className="text-orange-500 font-medium">
                Only {product.stock.quantity} left
              </span>
            ) : (
              <span className="text-green-500 font-medium">In Stock</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4">
          <Button
            variant="primary"
            size="small"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;