import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputClasses = `
    w-full neu-pressed px-4 py-3 text-slate-700 dark:text-white 
    bg-[#efeff2] dark:bg-black/30 
    placeholder:text-slate-400 dark:placeholder:text-gray-500 
    focus:outline-none focus:ring-2 focus:ring-primary/20 
    transition-all dark:border dark:border-white/10
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-200' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;