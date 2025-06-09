'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ProductCard from '../ProductCard';

export default function FavoriteItem() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
        }

        const res = await axios.get(`${apiUrl}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
          withCredentials: true,
        });

        setFavorites(res.data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600 text-center">You have no favorite products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {favorites.map((favorite) => (
            <ProductCard key={favorite._id} product={{
              _id: favorite.productId,
              name: favorite.name,
              price: favorite.price,
              category: favorite.category,
              images: [favorite.image],
              totalReviews: favorite.totalReviews,
              averageRating: favorite.averageRating
            }} />
          ))}
        </div>
      )}
    </div>
  );
}