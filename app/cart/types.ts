export interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize: string;
    images: string[];
}

export interface CartContextType {
    cartItems: CartItem[];
    removeFromCart?: (id: string, size: string) => void;
    updateQuantity?: (id: string, size: string, quantity: number) => void;
    getCartTotal?: () => number;
    clearCart?: () => void;
} 