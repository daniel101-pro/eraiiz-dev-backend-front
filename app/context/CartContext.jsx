'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch cart from backend when user logs in
    const fetchCartFromBackend = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setCartItems([]);
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data) {
                // Transform backend cart items to match our frontend structure
                const transformedItems = response.data.map(item => ({
                    ...item.productId,
                    quantity: item.quantity,
                    selectedSize: item.selectedSize,
                }));

                setCartItems(transformedItems);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                // Handle unauthorized error
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            } else {
                toast.error('Failed to load your cart');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart when component mounts and when user/token changes
    useEffect(() => {
        fetchCartFromBackend();
        
        // Listen for storage events to sync cart across tabs
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'accessToken') {
                fetchCartFromBackend();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCart = async (product, quantity = 1, selectedSize = 'S') => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Please log in to add items to cart');
            return;
        }

        if (!product || !product._id) {
            toast.error('Invalid product');
            return;
        }

        if (quantity < 1) {
            toast.error('Invalid quantity');
            return;
        }

        // Store the previous state in case we need to revert
        const previousItems = [...cartItems];

        try {
            // First update the UI optimistically
            setCartItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(
                    item => item._id === product._id && item.selectedSize === selectedSize
                );

                if (existingItemIndex >= 0) {
                    const updatedItems = [...prevItems];
                    const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
                    
                    if (newQuantity > 99) {
                        toast.error('Maximum quantity reached');
                        return prevItems;
                    }
                    
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: newQuantity
                    };
                    return updatedItems;
                } else {
                    return [...prevItems, {
                        ...product,
                        quantity,
                        selectedSize,
                    }];
                }
            });

            // Show success toast
            toast.success('Added to cart!');

            // Then sync with backend
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
                productId: product._id,
                quantity,
                selectedSize
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            // Revert the optimistic update
            setCartItems(previousItems);
            if (error.response?.status === 401) {
                toast.error('Please log in to continue');
                window.location.href = '/login';
            } else {
                toast.error('Failed to add item to cart');
            }
        }
    };

    const removeFromCart = async (productId, selectedSize) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Please log in to continue');
            return;
        }

        // Store the previous state
        const previousItems = [...cartItems];

        try {
            // First update the UI optimistically
            setCartItems(prevItems =>
                prevItems.filter(item => !(item._id === productId && item.selectedSize === selectedSize))
            );

            // Show success toast
            toast.success('Removed from cart!');

            // Then sync with backend
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${productId}/${selectedSize}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

        } catch (error) {
            console.error('Error removing from cart:', error);
            // Revert the optimistic update
            setCartItems(previousItems);
            if (error.response?.status === 401) {
                toast.error('Please log in to continue');
                window.location.href = '/login';
            } else {
                toast.error('Failed to remove item from cart');
            }
        }
    };

    const updateQuantity = async (productId, selectedSize, newQuantity) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Please log in to continue');
            return;
        }

        // Store the previous state
        const previousItems = [...cartItems];

        try {
            // First update the UI optimistically
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === productId && item.selectedSize === selectedSize
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            // Show success toast
            toast.success(newQuantity === 0 ? 'Removed from cart!' : 'Quantity updated!');

            if (newQuantity === 0) {
                // Remove item if quantity is 0
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${productId}/${selectedSize}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
            } else {
                // Update quantity in backend
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
                    productId,
                    quantity: newQuantity,
                    selectedSize
                }, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
            }

        } catch (error) {
            console.error('Error updating quantity:', error);
            // Revert the optimistic update
            setCartItems(previousItems);
            if (error.response?.status === 401) {
                toast.error('Please log in to continue');
                window.location.href = '/login';
            } else {
                toast.error('Failed to update quantity');
            }
        }
    };

    const clearCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Please log in to continue');
            return;
        }

        // Store the previous state
        const previousItems = [...cartItems];

        try {
            // First update the UI optimistically
            setCartItems([]);

            // Show success toast
            toast.success('Cart cleared!');

            // Then sync with backend
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

        } catch (error) {
            console.error('Error clearing cart:', error);
            // Revert the optimistic update
            setCartItems(previousItems);
            if (error.response?.status === 401) {
                toast.error('Please log in to continue');
                window.location.href = '/login';
            } else {
                toast.error('Failed to clear cart');
            }
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            isLoading
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