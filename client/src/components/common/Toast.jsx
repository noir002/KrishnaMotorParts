import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500 dark:bg-green-600',
          icon: 'check_circle',
          iconColor: 'text-white'
        };
      case 'error':
        return {
          bg: 'bg-red-500 dark:bg-red-600',
          icon: 'error',
          iconColor: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500 dark:bg-yellow-600',
          icon: 'warning',
          iconColor: 'text-white'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500 dark:bg-blue-600',
          icon: 'info',
          iconColor: 'text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}>
      <span className={`material-symbols-outlined ${styles.iconColor}`}>
        {styles.icon}
      </span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="hover:bg-white/20 rounded-full p-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

export default Toast;