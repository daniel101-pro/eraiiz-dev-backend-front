'use client';

import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../app/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { convertPrice, formatPrice } = useCurrency();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/products', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) {
              const errorText = await retryRes.text();
              throw new Error(`Failed to fetch products after retry: ${errorText}`);
            }
            const data = await retryRes.json();
            console.log('Products data after retry:', data);
            setProducts(Array.isArray(data) ? data : []);
          } catch (refreshErr) {
            console.error('Refresh token error:', refreshErr.message);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            window.location.href = '/login';
            return;
          }
        } else {
          const errorText = await res.text();
          throw new Error(`Failed to fetch products: ${errorText}`);
        }
      }

      const data = await res.json();
      console.log('Products data:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch products error:', err.message);
      setError(err.message);
      setProducts([]); // Reset products to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToFavorites = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add to favorites: ${errorText}`);
      }

      const data = await res.json();
      alert(`${data.name} has been added to your favorites!`);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (isLoading) return <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div></div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/product/${product._id}`}
          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {product.description}
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {formatPrice(convertPrice(product.price))}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}