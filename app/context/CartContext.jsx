'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, selectedSize = 'S') => {
        setCartItems(prevItems => {
            // Check if this exact product with the same ID and size exists
            const existingItemIndex = prevItems.findIndex(
                item => item._id === product._id && item.selectedSize === selectedSize
            );

            if (existingItemIndex >= 0) {
                // Update quantity of existing item
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity
                };
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, {
                    ...product,
                    quantity,
                    selectedSize,
                }];
            }
        });
    };

    const removeFromCart = (productId, selectedSize) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item._id === productId && item.selectedSize === selectedSize))
        );
    };

    const updateQuantity = (productId, selectedSize, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId && item.selectedSize === selectedSize
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
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
            getCartTotal
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