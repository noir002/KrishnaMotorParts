import { useState, useCallback } from 'react';

// Custom hook for managing loading states
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingStates, setLoadingStates] = useState({});

  const startLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      setLoading(true);
    } else {
      setLoadingStates(prev => ({ ...prev, [key]: true }));
    }
  }, []);

  const stopLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      setLoading(false);
    } else {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const isLoading = useCallback((key = 'default') => {
    if (key === 'default') {
      return loading;
    }
    return loadingStates[key] || false;
  }, [loading, loadingStates]);

  const withLoading = useCallback(async (asyncFunction, key = 'default') => {
    try {
      startLoading(key);
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    withLoading
  };
};