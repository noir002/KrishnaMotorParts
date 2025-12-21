import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'medium',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  const baseClasses = `
    neu-flat transition-all duration-300
    ${hover ? 'hover:translate-y-[-2px] hover:shadow-lg dark:hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]' : ''}
    ${paddingClasses[padding]}
    ${className}
  `;

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;