'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DualNavbarSell from '../components/DualNavbarSell';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function CategoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Categories | Eraiiz';
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', image: '/recycling-grid.png', color: 'bg-gradient-to-r from-green-400 to-green-600' },
    { id: 'plastic', name: 'Plastic', image: '/plastic-products.png', color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
    { id: 'glass', name: 'Glass', image: '/glass-products.png', color: 'bg-gradient-to-r from-cyan-400 to-cyan-600' },
    { id: 'rubber', name: 'Rubber', image: '/image3.png', color: 'bg-gradient-to-r from-gray-400 to-gray-600' },
    { id: 'wood', name: 'Wood', image: '/image4.png', color: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { id: 'palm', name: 'Palm', image: '/image5.png', color: 'bg-gradient-to-r from-orange-400 to-orange-600' },
    { id: 'recycled', name: 'Recycled', image: '/recycled-products.png', color: 'bg-gradient-to-r from-green-500 to-green-700' },
    { id: 'fruits', name: 'Fruits', image: '/image6.png', color: 'bg-gradient-to-r from-red-400 to-red-600' },
    { id: 'others', name: 'Others', image: '/image11.png', color: 'bg-gradient-to-r from-purple-400 to-purple-600' },
  ];

  const fetchProducts = async (category = 'all') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
      if (category !== 'all') {
        url += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await axios.get(url, {
        timeout: 10000,
      });
      
      // Ensure products is always an array
      let productData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          productData = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productData = response.data.data;
        } else if (typeof response.data === 'object' && Object.keys(response.data).length === 0) {
          productData = [];
        } else {
          console.warn('Unexpected API response format:', response.data);
          productData = [];
        }
      }
      
      console.log('Products data:', productData);
      setProducts(productData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]); // Ensure products is an empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getCategoryDisplayName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'All Products';
  };

  return (
    <>
      <DualNavbarSell />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center mb-8 mt-8">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-2">
                Product Categories
              </h1>
              <p className="text-xs text-gray-600">
                Discover sustainable products across all categories
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 min-w-[90px] h-8 ${
                    selectedCategory === category.id
                      ? 'bg-[#3F8E3F] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${category.color.replace('bg-gradient-to-r', 'bg')}`}></div>
                  <span className="text-center leading-none">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">
                {getCategoryDisplayName(selectedCategory)}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {Array.isArray(products) ? products.length : 0} {Array.isArray(products) && products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {selectedCategory !== 'all' && (
              <button
                onClick={() => handleCategoryClick('all')}
                className="text-xs text-[#3F8E3F] hover:text-[#357C35] font-medium"
              >
                View All Products
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F8E3F]"></div>
              <span className="ml-3 text-sm text-gray-600">Loading products...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading Products</h3>
              <p className="text-xs text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => fetchProducts(selectedCategory)}
                className="px-4 py-2 bg-[#3F8E3F] text-white text-xs rounded-lg hover:bg-[#357C35] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {!Array.isArray(products) || products.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-xs text-gray-500">
                    No products available in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Category Stats */}
          {!isLoading && !error && Array.isArray(products) && products.length > 0 && (
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-900 mb-3">Category Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Total Products</p>
                  <p className="font-semibold text-gray-900">{products.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price Range</p>
                  <p className="font-semibold text-gray-900">
                    ₦{Math.min(...products.map(p => p.price)).toLocaleString()} - ₦{Math.max(...products.map(p => p.price)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Average Rating</p>
                  <p className="font-semibold text-gray-900">
                    {(products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / products.length).toFixed(1)} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-semibold text-[#3F8E3F]">{getCategoryDisplayName(selectedCategory)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}