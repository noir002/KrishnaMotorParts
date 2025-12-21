import React from 'react';

const SortControls = ({ sortBy, sortOrder, onSortChange, totalResults = 0 }) => {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'popularity', label: 'Popularity' }
  ];

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new field
      onSortChange(newSortBy, 'asc');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 neu-flat p-4">
      {/* Results Count */}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        {totalResults > 0 ? (
          <>
            <span className="font-medium">{totalResults}</span> products found
          </>
        ) : (
          'No products found'
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Sort by:
        </span>
        
        <div className="flex items-center gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                sortBy === option.value
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className={`material-symbols-outlined text-sm transition-transform ${
                  sortOrder === 'desc' ? 'rotate-180' : ''
                }`}>
                  arrow_upward
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortControls;