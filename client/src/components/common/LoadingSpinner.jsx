import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-slate-200 dark:border-slate-700`}></div>
        
        {/* Spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin absolute top-0 left-0`}></div>
      </div>
      
      {text && (
        <p className={`${textSizeClasses[size]} text-slate-600 dark:text-gray-300 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;