import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

// Custom hook for real-time stock updates
export const useRealTimeStock = (productId, initialStock = null) => {
  const [stock, setStock] = useState(initialStock);
  const { getStockUpdate, subscribeToProduct, unsubscribeFromProduct } = useNotifications();

  useEffect(() => {
    if (!productId) return;

    // Subscribe to product stock updates
    subscribeToProduct(productId);

    // Check for existing stock update
    const existingUpdate = getStockUpdate(productId);
    if (existingUpdate) {
      setStock(existingUpdate);
    }

    // Cleanup: unsubscribe when component unmounts or productId changes
    return () => {
      unsubscribeFromProduct(productId);
    };
  }, [productId, subscribeToProduct, unsubscribeFromProduct, getStockUpdate]);

  // Listen for stock updates
  useEffect(() => {
    const stockUpdate = getStockUpdate(productId);
    if (stockUpdate) {
      setStock(stockUpdate);
    }
  }, [getStockUpdate(productId), productId]);

  return stock;
};