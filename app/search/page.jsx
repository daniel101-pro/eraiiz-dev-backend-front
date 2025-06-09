'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import DualNavSell from '../components/DualNavbarSell';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchProducts = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found in localStorage');
      }

      const res = await axios.get(
        `${apiUrl}/api/products/?search=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      if (!res.data || !res.data.products || !Array.isArray(res.data.products)) {
        throw new Error('No products found or invalid response');
      }

      setProducts(res.data.products);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function to avoid excessive API calls
  const debouncedSearch = debounce((searchQuery) => {
    if (searchQuery.trim()) {
      fetchProducts(searchQuery);
    } else {
      setProducts([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
    // Cleanup debounce on component unmount
    return () => debouncedSearch.cancel();
  }, [query]);

  return (
    <div>
      <DualNavSell />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Products</h1>
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, or description..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading && (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && products.length === 0 && !error && query && (
          <div className="text-center text-gray-600 mb-4">No products found for "{query}".</div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}