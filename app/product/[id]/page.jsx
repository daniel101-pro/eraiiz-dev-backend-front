'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { toast, Toaster } from 'react-hot-toast';
import DualNavbarSell from '../../components/DualNavbarSell';
import ImageGallery from '../../components/ImageGallery';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { convertPrice, formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [seller, setSeller] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '', images: [] });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isInCartState, setIsInCartState] = useState(false);

  // Check if item is in cart
  const checkIsInCart = () => {
    return cartItems.some(item => item._id === product?._id && item.selectedSize === selectedSize);
  };

  // Update isInCartState whenever relevant dependencies change
  useEffect(() => {
    if (product && selectedSize) {
      setIsInCartState(checkIsInCart());
    }
  }, [product, selectedSize, cartItems]);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(`${apiUrl}/api/auth/refresh`, { refreshToken }, {
        timeout: 30000,
        withCredentials: true,
      });

      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        return res.data.accessToken;
      } else {
        throw new Error('No access token received');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
      throw err;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProductAndReviews = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = await refreshToken();
      }

      // Always fetch with authentication
      const productRes = await axios.get(`${apiUrl}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProduct(productRes.data);
      
      // Set initial selected attribute if available
      if (productRes.data.attributes && productRes.data.attributes.length > 0) {
        setSelectedAttribute(productRes.data.attributes[0]);
        if (productRes.data.attributes[0].values && productRes.data.attributes[0].values.length > 0) {
          setSelectedSize(productRes.data.attributes[0].values[0]);
        }
      }

      // Use populated seller data
      if (productRes.data.sellerId) {
        const sellerData = productRes.data.sellerId;
        setSeller({
          username: sellerData.name,
          isVerified: sellerData.isVerified,
          email: sellerData.email,
          role: sellerData.role
        });
      } else {
        setSeller({
          username: 'Anonymous Seller',
          isVerified: false,
          email: '',
          role: 'seller'
        });
      }

      // Fetch reviews
      try {
        const reviewsRes = await axios.get(`${apiUrl}/api/products/${id}/reviews`);
        setReviews(reviewsRes.data);
      } catch (reviewErr) {
        console.error('Error fetching reviews:', reviewErr);
        setReviews([]);
      }
    } catch (err) {
      console.error('Error in fetchProductAndReviews:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load product';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        toast.error('Please log in to view this product');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductAndReviews();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let token = localStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('rating', newReview.rating);
      formData.append('comment', newReview.comment);
      newReview.images.forEach((image) => {
        formData.append('images', image);
      });

      const res = await axios.post(`${apiUrl}/api/products/${id}/reviews`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Review submitted:', res.data);
      setNewReview({ rating: 0, comment: '', images: [] });
      fetchProductAndReviews(); // Refresh product and reviews
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshToken();
          const formData = new FormData();
          formData.append('rating', newReview.rating);
          formData.append('comment', newReview.comment);
          newReview.images.forEach((image) => {
            formData.append('images', image);
          });

          await axios.post(`${apiUrl}/api/products/${id}/reviews`, formData, {
            headers: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
          });
          setNewReview({ rating: 0, comment: '', images: [] });
          fetchProductAndReviews();
        } catch (refreshErr) {
          setReviewError(refreshErr.response?.data?.message || 'Failed to submit review');
        }
      } else {
        setReviewError(err.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let token = localStorage.getItem('accessToken');

      await axios.post(`${apiUrl}/api/products/reviews/${reviewId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      fetchProductAndReviews(); // Refresh reviews
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleDislikeReview = async (reviewId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let token = localStorage.getItem('accessToken');

      await axios.post(`${apiUrl}/api/products/reviews/${reviewId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      fetchProductAndReviews(); // Refresh reviews
    } catch (err) {
      console.error('Error disliking review:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedAttribute) {
      toast.error('Please select a size', {
        id: 'size-error',
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in to add items to cart', {
          id: 'login-error',
          duration: 3000,
          position: 'top-center',
        });
        router.push('/login');
        return;
      }

      setIsAddingToCart(true);
      
      // Show success toast immediately with a unique ID
      toast.success('Item has been added to cart! 🛍️', {
        id: 'add-to-cart-success',
        duration: 3000,
        position: 'top-center',
      });

      // Format cart item
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        selectedSize: selectedSize,
        images: product.images
      };

      // Add to cart in the background
      await addToCart(cartItem);
      setIsInCartState(true);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart. Please try again.', {
        id: 'add-to-cart-error',
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedAttribute) {
      toast.error('Please select a size', {
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '⚠️',
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in to proceed with purchase', {
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
          },
          icon: '🔒',
        });
        router.push('/login');
        return;
      }

      setIsBuyingNow(true);
      
      // First add to cart
      await handleAddToCart();
      // Then redirect to billing page
      router.push('/checkout/billing');
    } catch (err) {
      console.error('Error proceeding to checkout:', err);
      toast.error('Failed to proceed to checkout. Please try again.', {
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '❌',
      });
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Calculate rating distribution percentages
  const calculateRatingPercentage = (rating) => {
    if (!product?.ratingDistribution || !product.totalReviews) return 0;
    return (product.ratingDistribution[rating] / product.totalReviews) * 100;
  };

  const calculateDiscountedPrice = () => {
    if (!product?.bonus?.enabled) return null;
    
    const originalPrice = product.price;
    if (product.bonus.type === 'percentage') {
      return originalPrice - (originalPrice * (product.bonus.value / 100));
    } else {
      return originalPrice - product.bonus.value;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 bg-green-100 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium animate-fadeIn">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="text-green-600 mb-4 inline-block">← Back to products section</Link>
        <div className="text-red-600 text-center">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <>
      <DualNavbarSell />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <span className="mr-2">←</span>
            Back to products section
          </Link>
        </div>

        {/* Product Images and Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mb-16">
          {/* Left Column - Product Images */}
          <div className="relative">
            <ImageGallery images={product.images} />
            {product.bonus?.enabled && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                {product.bonus.type === 'percentage' 
                  ? `-${product.bonus.value}% OFF`
                  : `-₦${product.bonus.value.toLocaleString()} OFF`
                }
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              {product.name} by{' '}
              <span className="text-green-600">{seller?.username || 'Seller'}</span>
            </h1>

            <div className="mt-3 flex items-center">
              <div className="flex items-center">
                <span className="text-green-600 mr-1">{product.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-gray-500">★</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">
                From {product.totalReviews || 0} ratings, {reviews.length} reviews
              </span>
            </div>

            <div className="mt-4">
              {product.bonus?.enabled ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium text-gray-400 line-through">
                      {formatPrice(convertPrice(product.price))}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                      {product.bonus.type === 'percentage' 
                        ? `${product.bonus.value}% OFF`
                        : `₦${product.bonus.value.toLocaleString()} OFF`
                      }
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatPrice(convertPrice(calculateDiscountedPrice()))}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-medium text-gray-900">
                  {formatPrice(convertPrice(product.price))}
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[28px] font-normal text-gray-700 mb-4">Select size</h3>
                <div className="grid grid-cols-5 gap-4">
                  {['S', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
                    const isAvailable = product.attributes[0].values.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`
                          py-3 px-4 text-base font-medium rounded-xl border-2
                          ${selectedSize === size && isAvailable
                            ? 'border-green-600 bg-white text-green-600'
                            : isAvailable
                              ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mt-8">
              <h3 className="text-[28px] font-normal text-gray-700 mb-4">Quantity</h3>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-32 h-12 mx-4 text-center text-lg font-medium bg-white border-2 border-gray-200 rounded-xl"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-white bg-green-600 rounded-xl hover:bg-green-700"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className={`w-full bg-green-600 text-white py-4 px-6 rounded-2xl text-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center ${
                  isBuyingNow ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isBuyingNow ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">Buy now</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              <button
                onClick={isInCartState ? handleViewCart : handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full ${
                  isInCartState 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                } border border-green-600 rounded-lg px-6 py-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                  isAddingToCart ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-green-600 font-medium">Adding to cart...</span>
                  </div>
                ) : isInCartState ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    View Cart
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product Description and Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Product Description */}
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Product description</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 font-medium">Name:</p>
                <p className="text-gray-900">{product.name}</p>
              </div>

              <div>
                <p className="text-gray-600 font-medium">Material:</p>
                <p className="text-gray-900">{product.material || 'Material used'}</p>
              </div>

              {product.details && product.details.map((detail, index) => (
                <div key={index}>
                  <p className="text-gray-600 font-medium">Detail:</p>
                  <p className="text-gray-900">{detail}</p>
                </div>
              ))}

              <div className="mt-6">
                <p className="text-gray-900">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Ratings and Reviews */}
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-6">Product ratings and reviews</h2>
            
            {/* Rating Distribution */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center min-w-[100px]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={`text-sm ${index < rating ? 'text-green-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${calculateRatingPercentage(rating)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 min-w-[40px]">
                      {product.ratingDistribution?.[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <Image
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.username}`}
                          alt={review.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.username}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <span
                                key={index}
                                className={`text-sm ${
                                  index < review.rating ? 'text-green-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-20 h-20">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => handleLikeReview(review._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        <span>👍</span>
                        <span>{review.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleDislikeReview(review._id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        <span>👎</span>
                        <span>{review.dislikes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}