import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const RelatedProducts = ({ productId, category, brand, compatibility = [] }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleApiResponse } = useErrorHandler();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        // Build query parameters for related products
        const params = {
          limit: 8 // Show max 8 related products
        };

        // Add category filter if available
        if (category) {
          params.category = typeof category === 'object' ? category._id : category;
        }

        // Add brand filter if available
        if (brand) {
          params.brand = brand;
        }

        // Add vehicle compatibility if available
        if (compatibility && compatibility.length > 0) {
          const firstVehicle = compatibility[0];
          if (firstVehicle.make) {
            params.vehicleMake = firstVehicle.make;
          }
        }

        const response = await productService.getRelatedProducts(productId, params);
        const result = handleApiResponse(response, 'fetching related products');
        
        if (result.success) {
          setRelatedProducts(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, category, brand, compatibility, handleApiResponse]);

  if (loading) {
    return (
      <div className="neu-flat p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">
            recommend
          </span>
          Related Products
        </h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="neu-flat p-8 text-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">
            recommend
          </span>
          Related Products
        </h3>
        <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600 mb-2">
          search_off
        </span>
        <p className="text-slate-500 dark:text-slate-400">
          No related products found
        </p>
      </div>
    );
  }

  return (
    <div className="neu-flat p-6">
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">
          recommend
        </span>
        Related Products
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <div key={product._id} className="transform scale-90">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;