import React from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductList = ({ products, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="neu-flat p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
          error
        </span>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Error Loading Products
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          {error}
        </p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="neu-flat p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600 mb-4">
          search_off
        </span>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;