import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';

const RelatedProducts = ({ productId, category, brand }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      setLoading(true);

      try {
        // Build query parameters for related products
        const params = {
          limit: 12 // Show max 12 related products to filter from
        };

        // Add category filter if available
        if (category) {
          params.category = typeof category === 'object' ? category._id : category;
        }

        console.log('Fetching related products with params:', params);

        const response = await productService.getProducts(params);
        
        if (response.success && response.data?.products) {
          // Filter out the current product and limit results
          const allProducts = response.data.products;
          console.log('All products fetched:', allProducts.length);
          
          const filteredProducts = allProducts
            .filter(product => product._id !== productId)
            .slice(0, 8);
            
          console.log('Filtered related products:', filteredProducts.length);
          setRelatedProducts(filteredProducts);
        } else {
          console.log('No products found or API error');
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, category, brand]);

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

  if (!relatedProducts || relatedProducts.length === 0) {
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