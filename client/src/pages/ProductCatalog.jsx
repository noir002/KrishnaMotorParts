import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLoading } from '../hooks/useLoading';
import SearchBar from '../components/product/SearchBar';
import ProductFilters from '../components/product/ProductFilters';
import ProductList from '../components/product/ProductList';
import SortControls from '../components/product/SortControls';
import Pagination from '../components/common/Pagination';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const { handleApiResponse } = useErrorHandler();
  const { loading, withLoading } = useLoading(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12;
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    inStock: false
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Categories and brands for filters
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch categories and brands for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await productService.getCategories();
        const categoriesResult = handleApiResponse(categoriesResponse, 'fetching categories');
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }
        
        // Fetch unique brands from products
        const brandsResponse = await productService.getBrands();
        const brandsResult = handleApiResponse(brandsResponse, 'fetching brands');
        if (brandsResult.success) {
          setBrands(brandsResult.data);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
  }, [handleApiResponse]);

  // Fetch products based on search, filters, sort, and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      await withLoading(async () => {
        setError(null);

        try {
          // Build query parameters
          const params = {
            page: currentPage,
            limit: itemsPerPage,
            sortBy,
            sortOrder
          };
          
          // Add search
          if (searchQuery) {
            params.search = searchQuery;
          }
          
          // Add filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              params[key] = value;
            }
          });

          const response = await productService.getProducts(params);
          const result = handleApiResponse(response, 'fetching products');
          
          if (result.success) {
            setProducts(result.data?.products || []);
            setTotalPages(result.pagination?.pages || 1);
            setTotalProducts(result.pagination?.total || 0);
          } else {
            setError(result.error);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          setError('Failed to load products');
        }
      });
    };

    fetchProducts();
  }, [currentPage, searchQuery, filters, sortBy, sortOrder, withLoading, handleApiResponse]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#efeff2] dark:bg-slate-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
            Product Catalog
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            Browse our extensive collection of automobile spare parts
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              categories={categories}
              brands={brands}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort Controls */}
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              totalResults={totalProducts}
            />

            {/* Product List */}
            <ProductList
              products={products}
              loading={loading}
              error={error}
            />

            {/* Pagination */}
            {!loading && !error && products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;