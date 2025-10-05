import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], summary: null });
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
    } else {
      // Clear cart if user is not authenticated
      setCart({ items: [], summary: null });
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/users/cart');
      
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await api.post('/users/cart', {
        productId,
        quantity
      });
      
      if (response.data.success) {
        // Reload cart to get updated data
        await loadCart();
        toast.success('Item added to cart');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      const response = await api.put(`/users/cart/${productId}`, {
        quantity
      });
      
      if (response.data.success) {
        // Reload cart to get updated data
        await loadCart();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      const response = await api.delete(`/users/cart/${productId}`);
      
      if (response.data.success) {
        // Reload cart to get updated data
        await loadCart();
        toast.success('Item removed from cart');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      const response = await api.delete('/users/cart');
      
      if (response.data.success) {
        setCart({ items: [], summary: null });
        toast.success('Cart cleared');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart item count
  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.items.some(item => item.product._id === productId);
  };

  // Get quantity of specific product in cart
  const getProductQuantity = (productId) => {
    const item = cart.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
    isInCart,
    getProductQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};