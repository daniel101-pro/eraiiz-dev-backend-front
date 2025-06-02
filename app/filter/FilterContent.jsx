'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
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

        // Construct query string from search params
        const params = new URLSearchParams();
        if (searchParams.get('category')) params.append('category', searchParams.get('category'));
        if (searchParams.get('minPrice')) params.append('minPrice', searchParams.get('minPrice'));
        if (searchParams.get('maxPrice')) params.append('maxPrice', searchParams.get('maxPrice'));
        if (searchParams.get('inStock') === 'true') params.append('inStock', 'true');
        if (searchParams.get('minRating')) params.append('minRating', searchParams.get('minRating'));

        const res = await axios.get(`${apiUrl}/api/products/?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        });

        if (!res.data || !res.data.products || !Array.isArray(res.data.products)) {
          throw new Error('No products found or invalid response');
        }

        setProducts(res.data.products);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setError('Failed to fetch filtered products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchParams]);

  return (
    <>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading && (
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && products.length === 0 && !error && (
        <div className="text-center text-gray-600 mb-4">No products match your filters.</div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={product.images[0] || 'https://via.placeholder.com/200'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-green-600 font-semibold">₦{product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}