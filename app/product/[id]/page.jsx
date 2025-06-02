'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('S');

  useEffect(() => {
    console.log('Product ID from useParams:', id); // Debug: Check the ID

    const fetchProduct = async () => {
      let apiUrl; // Declare apiUrl outside try block
      try {
        apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Access token not found in localStorage');
        }

        const res = await axios.get(`${apiUrl}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        });

        if (!res.data) {
          throw new Error('Product not found');
        }

        console.log('Fetched product data:', res.data); // Debug: Log full response
        console.log('Images array:', res.data.images); // Debug: Log images specifically
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product - Raw Error:', err);
        console.log('API URL:', apiUrl, 'ID:', id, 'Token:', localStorage.getItem('accessToken'));
        console.error('Error Details:', {
          message: err.message,
          response: err.response?.data || 'No response data',
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
        setError('Product not found or failed to load');
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      console.error('No product ID provided');
      setError('No product ID provided');
      router.push('/404');
    }
  }, [id, router]);

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
    return <div className="text-red-600 text-center">{error || 'Product not found'}</div>;
  }

  const sizes = ['S', 'L', 'XL', 'XXL', 'XXXL'];
  const sampleReviews = [
    { name: 'Name of customer', rating: 3.9, date: '10/11/2024', comment: 'Lorem ipsum...', image: '/shoe1.jpg' },
    { name: 'Name of customer', rating: 4.5, date: '10/11/2024', comment: 'Lorem ipsum...', image: '/shoe2.jpg' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard/seller" className="text-green-600 mb-4 inline-block">← Back to products section</Link>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full h-96 rounded-lg mb-4">
            <img
              src={product.images[0] || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => console.log('Main image load error:', e.target.src, 'Status:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but not displayed')}
              onLoad={(e) => console.log('Main image loaded:', e.target.src)}
            />
          </div>
          <div className="flex gap-2">
            {/* Thumbnail 1 */}
            <div className="w-16 h-16 rounded overflow-hidden">
              <img
                src={product.images[0] || 'https://via.placeholder.com/64'}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                onError={(e) => console.log('Image load error for index 0:', e.target.src, 'Status:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but not displayed')}
                onLoad={(e) => console.log('Image loaded for index 0:', e.target.src)}
              />
            </div>
            {/* Thumbnail 2 */}
            <div className="w-16 h-16 rounded overflow-hidden">
              <img
                src={product.images[1] || 'https://via.placeholder.com/64'}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                onError={(e) => console.log('Image load error for index 1:', e.target.src, 'Status:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but not displayed')}
                onLoad={(e) => console.log('Image loaded for index 1:', e.target.src)}
              />
            </div>
            {/* Thumbnail 3 */}
            <div className="w-16 h-16 rounded overflow-hidden">
              <img
                src={product.images[2] || 'https://via.placeholder.com/64'}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                onError={(e) => console.log('Image load error for index 2:', e.target.src, 'Status:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but not displayed')}
                onLoad={(e) => console.log('Image loaded for index 2:', e.target.src)}
              />
            </div>
            {/* Thumbnail 4 */}
            <div className="w-16 h-16 rounded overflow-hidden">
              <img
                src={product.images[3] || 'https://via.placeholder.com/64'}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                onError={(e) => console.log('Image load error for index 3:', e.target.src, 'Status:', e.target.naturalWidth === 0 ? 'Failed to load' : 'Loaded but not displayed')}
                onLoad={(e) => console.log('Image loaded for index 3:', e.target.src)}
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-3xl font-semibold text-green-600">₦{product.price.toLocaleString()} <span className="text-sm text-gray-500 line-through">₦350,000,000</span> 20% off</p>
          <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <span>3.8</span>
            <span>★ ★ ★ ★ ☆</span>
            <span className="text-gray-600 text-sm">From 1,245 ratings, 786 reviews</span>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select size</label>
            <div className="flex gap-2 mt-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded ${selectedSize === size ? 'bg-green-100 border-green-600' : 'border-gray-300'}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 border rounded text-center"
              />
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Buy now</button>
            <button className="bg-white text-green-600 px-6 py-2 border border-green-600 rounded hover:bg-gray-100">Add to Cart 🛒</button>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Product description</h2>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Material:</strong> Material used</p>
          <p><strong>Details:</strong> Other details</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        {/* Product Ratings and Reviews */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Product ratings and reviews</h2>
          <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <span>3.8</span>
            <span>★ ★ ★ ★ ☆</span>
            <span className="text-gray-600 text-sm">(1,290)</span>
            <span className="text-gray-600 text-sm">★★★★☆ (280)</span>
            <span className="text-gray-600 text-sm">★★★★☆ (87)</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Product reviews</h3>
          {sampleReviews.map((review, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <Image src="/user-placeholder.jpg" alt={review.name} width={32} height={32} className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500 mt-1">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <span key={i}>{i < Math.floor(review.rating) ? '★' : i < review.rating ? '☆' : '☆'}</span>
                  ))}
                <span className="text-sm text-gray-600 ml-2">{review.rating}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
              <div className="flex gap-2 mt-2">
                <Image src={review.image} alt="Review image" width={64} height={64} className="rounded" />
                <Image src={review.image} alt="Review image" width={64} height={64} className="rounded" />
              </div>
              <div className="flex gap-2 mt-1">
                <button className="text-blue-600 text-sm">👍 148</button>
                <button className="text-blue-600 text-sm">👎 24</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Info */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
            <Image src="/vendor-placeholder.jpg" alt="Vendor logo" width={48} height={48} className="object-cover" />
          </div>
          <div>
            <p><strong>Name of company</strong></p>
            <p className="text-sm text-gray-600">Vendor rating: ★★★★☆</p>
            <p className="text-sm text-gray-600">Specialization</p>
            <p className="text-sm text-green-600"><Link href="/vendor">View products</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}