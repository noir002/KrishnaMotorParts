import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/ToastContainer';
import { useErrorHandler } from '../hooks/useErrorHandler';

const CartContext = createContext();

// Cart reducer to manage cart state
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        loading: false
      };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { handleApiResponse } = useErrorHandler();

  // Helper function to transform backend cart items to frontend format
  const transformCartItems = (backendItems) => {
    return backendItems.map(item => ({
      productId: item.productId?._id || item.productId,
      name: item.productId?.name || item.name || 'Unknown Product',
      price: item.productId?.discountPrice || item.productId?.price || item.price || 0,
      image: item.productId?.images?.[0] || item.image || '',
      quantity: item.quantity,
      stock: item.productId?.stock?.quantity || item.stock || 0
    }));
  };

  // Load cart from localStorage for guest users or API for authenticated users
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        if (isAuthenticated) {
          // Load cart from API for authenticated users
          const response = await cartService.getCart();
          const result = handleApiResponse(response, 'loading cart');
          
          if (result.success) {
            // Extract cart items from the API response structure
            const cartData = result.data.cart || result.data;
            const backendItems = cartData.items || [];
            
            // Transform backend cart items to frontend format
            const transformedItems = transformCartItems(backendItems);
            
            dispatch({ type: 'SET_CART', payload: transformedItems });
          }
        } else {
          // Load cart from localStorage for guest users
          const savedCart = localStorage.getItem('cart');
          const cartItems = savedCart ? JSON.parse(savedCart) : [];
          dispatch({ type: 'SET_CART', payload: cartItems });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
      }
    };

    loadCart();
  }, [isAuthenticated, handleApiResponse]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0] || '',
        quantity: quantity,
        stock: product.stock?.quantity || 0
      };

      if (isAuthenticated) {
        // Add to cart via API for authenticated users
        const response = await cartService.addToCart(product._id, quantity);
        const result = handleApiResponse(response, 'adding to cart');
        
        if (!result.success) {
          return result;
        }

        // Reload cart from server to get updated state
        const cartResponse = await cartService.getCart();
        const cartResult = handleApiResponse(cartResponse, 'loading updated cart');
        
        if (cartResult.success) {
          const cartData = cartResult.data.cart || cartResult.data;
          const backendItems = cartData.items || [];
          const transformedItems = transformCartItems(backendItems);
          dispatch({ type: 'SET_CART', payload: transformedItems });
        }
      } else {
        // Add to local cart for guest users
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
      }

      showSuccess(`${product.name} added to cart`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update item quantity in cart
  const updateCartItem = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }

      if (isAuthenticated) {
        // Update cart via API for authenticated users
        const response = await cartService.updateCartItem(productId, quantity);
        const result = handleApiResponse(response, 'updating cart item');
        
        if (!result.success) {
          return result;
        }

        // Reload cart from server to get updated state
        const cartResponse = await cartService.getCart();
        const cartResult = handleApiResponse(cartResponse, 'loading updated cart');
        
        if (cartResult.success) {
          const cartData = cartResult.data.cart || cartResult.data;
          const backendItems = cartData.items || [];
          const transformedItems = transformCartItems(backendItems);
          dispatch({ type: 'SET_CART', payload: transformedItems });
        }
      } else {
        // Update local cart for guest users
        dispatch({ 
          type: 'UPDATE_ITEM', 
          payload: { productId, quantity } 
        });
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        // Remove from cart via API for authenticated users
        const response = await cartService.removeFromCart(productId);
        const result = handleApiResponse(response, 'removing from cart');
        
        if (!result.success) {
          return result;
        }

        // Reload cart from server to get updated state
        const cartResponse = await cartService.getCart();
        const cartResult = handleApiResponse(cartResponse, 'loading updated cart');
        
        if (cartResult.success) {
          const cartData = cartResult.data.cart || cartResult.data;
          const backendItems = cartData.items || [];
          const transformedItems = transformCartItems(backendItems);
          dispatch({ type: 'SET_CART', payload: transformedItems });
        }
      } else {
        // Remove from local cart for guest users
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      }

      showSuccess('Item removed from cart');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // Clear cart via API for authenticated users
        const response = await cartService.clearCart();
        const result = handleApiResponse(response, 'clearing cart');
        
        if (!result.success) {
          return result;
        }
      }

      dispatch({ type: 'CLEAR_CART' });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const itemCount = state.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    return {
      subtotal: subtotal.toFixed(2),
      itemCount,
      items: state.items
    };
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotals,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;