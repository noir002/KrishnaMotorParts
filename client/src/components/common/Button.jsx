import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-bold transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'rounded-full bg-primary text-white shadow-[6px_6px_12px_#d1d1d6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] dark:bg-gradient-to-r dark:from-primary dark:to-red-600 dark:shadow-[0_0_20px_rgba(215,25,32,0.4)] dark:border dark:border-white/20 hover:scale-105 focus:ring-primary/20',
    secondary: 'neu-btn text-slate-700 dark:text-white dark:bg-white/5 dark:hover:bg-white/10 hover:text-primary focus:ring-slate-300',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white rounded-full focus:ring-primary/20',
    ghost: 'text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg focus:ring-slate-300'
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm min-h-[36px]',
    medium: 'px-6 py-3 text-base min-h-[44px]',
    large: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
};

export default Button;