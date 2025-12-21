import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

const ProductFilters = ({ onFiltersChange, categories = [], brands = [] }) => {
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

  const [isExpanded, setIsExpanded] = useState(false);

  // Common vehicle makes for dropdown
  const vehicleMakes = [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota',
    'Ford', 'Chevrolet', 'Nissan', 'Volkswagen', 'Skoda', 'Renault',
    'Bajaj', 'Hero', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki'
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      inStock: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  return (
    <div className="neu-flat p-4 space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined">
            tune
          </span>
          Filters
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <span className={`material-symbols-outlined transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full neu-pressed px-3 py-2 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id || category} value={category._id || category}>
                {category.name || category}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
            Brand
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full neu-pressed px-3 py-2 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-2">
            Price Range (₹)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Vehicle Compatibility */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-600 dark:text-gray-300">
            Vehicle Compatibility
          </h4>
          
          {/* Vehicle Make */}
          <div>
            <select
              value={filters.vehicleMake}
              onChange={(e) => handleFilterChange('vehicleMake', e.target.value)}
              className="w-full neu-pressed px-3 py-2 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10 text-sm"
            >
              <option value="">Select Make</option>
              {vehicleMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Model */}
          <div>
            <Input
              placeholder="Vehicle Model"
              value={filters.vehicleModel}
              onChange={(e) => handleFilterChange('vehicleModel', e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Vehicle Year */}
          <div>
            <Input
              type="number"
              placeholder="Year (e.g., 2020)"
              value={filters.vehicleYear}
              onChange={(e) => handleFilterChange('vehicleYear', e.target.value)}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="text-sm"
            />
          </div>
        </div>

        {/* Stock Filter */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-slate-600 dark:text-gray-300">
              In Stock Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;