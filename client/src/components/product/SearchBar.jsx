import React, { useState } from 'react';
import Button from '../common/Button';

const SearchBar = ({ onSearch, placeholder = "Search for spare parts..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="neu-flat p-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full neu-pressed pl-12 pr-10 py-3 text-slate-700 dark:text-white bg-[#efeff2] dark:bg-black/30 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:border dark:border-white/10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                close
              </span>
            </button>
          )}
        </div>
        <Button type="submit" variant="primary">
          <span className="material-symbols-outlined">
            search
          </span>
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;