'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCartFromBackend = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return; // Don't try to fetch if no token
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && Array.isArray(response.data.items)) {
                setCart(response.data.items);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                // Token might be expired, try to refresh
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        const refreshResponse = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
                            { refreshToken }
                        );
                        
                        if (refreshResponse.data.accessToken) {
                            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
                            // Retry the cart fetch with new token
                            const retryResponse = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/cart/`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${refreshResponse.data.accessToken}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                            if (retryResponse.data && Array.isArray(retryResponse.data.items)) {
                                setCart(retryResponse.data.items);
                            }
                        }
                    }
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    // Clear tokens if refresh failed
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
            } else {
                console.error('Error fetching cart:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please log in to add items to cart');
                return;
            }

            // Optimistically update UI
            const updatedCart = [...cart];
            const existingItemIndex = updatedCart.findIndex(item => item.product._id === product._id);
            
            if (existingItemIndex !== -1) {
                updatedCart[existingItemIndex].quantity += quantity;
            } else {
                updatedCart.push({ product, quantity });
            }
            setCart(updatedCart);
            
            // Show success toast
            toast.success('Item added to cart');

            // Sync with backend
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`,
                { productId: product._id, quantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            // Revert optimistic update on error
            await fetchCartFromBackend();
            if (error.response?.status === 401) {
                toast.error('Please log in to add items to cart');
            } else {
                toast.error('Failed to add item to cart');
            }
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please log in to remove items from cart');
                return;
            }

            // Optimistically update UI
            const updatedCart = cart.filter(item => item.product._id !== productId);
            setCart(updatedCart);
            
            // Show success toast
            toast.success('Item removed from cart');

            // Sync with backend
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cart/remove/${productId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            // Revert optimistic update on error
            await fetchCartFromBackend();
            toast.error('Failed to remove item from cart');
            console.error('Error removing from cart:', error);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please log in to update cart');
                return;
            }

            // Optimistically update UI
            const updatedCart = cart.map(item => {
                if (item.product._id === productId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            setCart(updatedCart);

            // Sync with backend
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cart/update/${productId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            toast.success('Cart updated');
        } catch (error) {
            // Revert optimistic update on error
            await fetchCartFromBackend();
            toast.error('Failed to update cart');
            console.error('Error updating cart:', error);
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please log in to clear cart');
                return;
            }

            // Optimistically update UI
            setCart([]);
            
            // Show success toast
            toast.success('Cart cleared');

            // Sync with backend
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cart/clear`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            // Revert optimistic update on error
            await fetchCartFromBackend();
            toast.error('Failed to clear cart');
            console.error('Error clearing cart:', error);
        }
    };

    useEffect(() => {
        // Only fetch cart if user is logged in
        if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
            fetchCartFromBackend();
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCartFromBackend
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 