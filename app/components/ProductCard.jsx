'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }) {
  const { convertPrice, formatPrice } = useCurrency();
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const [quantity, setQuantity] = useState(0);

  // Check if item is in cart and get its quantity
  useEffect(() => {
    const cartItem = cartItems.find(item => item._id === product._id);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cartItems, product._id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, 'S');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, 'S');
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      if (newQuantity === 0) {
        removeFromCart(product._id, 'S');
      } else {
        updateQuantity(product._id, 'S', newQuantity);
      }
    }
  };

  return (
    <Link href={`/product/${product._id}`} className="block max-w-[320px]">
      <div className="bg-white rounded-[24px] overflow-hidden p-5 border border-[#E5E5E5]">
        {/* Product Details Section */}
        <div className="relative">
          {/* Title */}
          <h3 className="text-xs sm:text-sm md:text-base text-[#1A1A1A] font-medium leading-tight">
            {product.name}
          </h3>

          {/* Price and Reviews in same line */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm sm:text-base md:text-lg text-[#1A1A1A] font-semibold">
              #{product.price?.toLocaleString()}
            </div>
            <div className="text-[#666666] text-[10px] sm:text-xs">
              {product.totalReviews || '0'} reviews
            </div>
          </div>

          {/* Category Tag */}
          <div className="mt-3">
            <span className="inline-block bg-[#EBF6FF] text-[#1A1A1A] px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs">
              {product.category || 'Uncategorized'}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-0 right-0 flex items-center gap-1 bg-white rounded-full px-2.5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <svg className="w-2.5 h-2.5 text-[#3F8E3F]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[#3F8E3F] text-[10px] sm:text-xs font-medium">{product.averageRating?.toFixed(1) || '0.0'}</span>
          </div>

          {/* Product Image */}
          <div className="mt-4 mb-4">
            <div className="relative rounded-xl overflow-hidden h-[140px] sm:h-[180px] md:h-[220px]">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>

          {/* Add to Cart Button or Quantity Controls */}
          <div onClick={(e) => e.stopPropagation()}>
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#3F8E3F] text-white py-1.5 text-xs sm:text-sm font-medium rounded-[14px] hover:bg-[#357C35] transition-colors"
                style={{
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)'
                }}
              >
                Add to cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#F5F5F5] rounded-[14px] p-1.5">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 flex items-center justify-center text-[#3F8E3F] text-base font-semibold bg-white rounded-full shadow-sm hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-sm font-medium text-[#1A1A1A]">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 flex items-center justify-center text-[#3F8E3F] text-base font-semibold bg-white rounded-full shadow-sm hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 