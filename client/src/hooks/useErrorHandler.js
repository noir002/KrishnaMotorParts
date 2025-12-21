import { useCallback } from 'react';
import { useToast } from '../components/common/ToastContainer';

// Custom hook for centralized error handling
export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);

    let errorMessage = 'An unexpected error occurred';
    let shouldShowToast = true;

    if (error?.response) {
      // API error response
      const status = error.response.status;
      const apiError = error.response.data?.error?.message;

      switch (status) {
        case 400:
          errorMessage = apiError || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          // Don't show toast for auth errors as they're handled by interceptors
          shouldShowToast = false;
          break;
        case 403:
          errorMessage = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          errorMessage = apiError || 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = apiError || 'This action conflicts with existing data.';
          break;
        case 422:
          errorMessage = apiError || 'Please check your input and try again.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = apiError || `Request failed with status ${status}`;
      }
    } else if (error?.message) {
      // JavaScript error or network error
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (shouldShowToast) {
      showError(errorMessage);
    }

    return {
      message: errorMessage,
      status: error?.response?.status,
      originalError: error
    };
  }, [showError]);

  const handleApiResponse = useCallback((response, context = '') => {
    if (!response.success) {
      return handleError(
        {
          response: {
            status: response.status,
            data: { error: { message: response.error } }
          }
        },
        context
      );
    }
    return response;
  }, [handleError]);

  const handleWarning = useCallback((message) => {
    showWarning(message);
  }, [showWarning]);

  return {
    handleError,
    handleApiResponse,
    handleWarning
  };
};