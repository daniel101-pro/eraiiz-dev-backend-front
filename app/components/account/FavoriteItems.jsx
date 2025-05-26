import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function FavoriteItems() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFavorite, setNewFavorite] = useState({ name: '', category: '' });

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/favorites', {
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
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/favorites', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) throw new Error('Failed to fetch favorites');
            const data = await retryRes.json();
            setFavorites(data);
          } catch (refreshErr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error('Failed to fetch favorites');
        }
      }

      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to remove favorite');
      }

      setFavorites(favorites.filter(fav => fav._id !== favoriteId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddFavorite = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(newFavorite),
      });

      if (!res.ok) {
        throw new Error('Failed to add favorite');
      }

      const data = await res.json();
      setFavorites([...favorites, data]);
      setNewFavorite({ name: '', category: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading favorites...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-semibold mb-8">Favorite Items</h1>

      {/* Add New Favorite Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Favorite</h2>
        <form onSubmit={handleAddFavorite} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-700">Item Name:</label>
            <input
              type="text"
              value={newFavorite.name}
              onChange={(e) => setNewFavorite({ ...newFavorite, name: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Category:</label>
            <input
              type="text"
              value={newFavorite.category}
              onChange={(e) => setNewFavorite({ ...newFavorite, category: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Add Favorite
          </button>
        </form>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <p className="text-gray-700">No favorite items found.</p>
      ) : (
        <div className="space-y-4">
          {favorites.map(fav => (
            <div key={fav._id} className="border-b pb-4 flex justify-between items-center">
              <div>
                <p><strong>Name:</strong> {fav.name}</p>
                <p><strong>Category:</strong> {fav.category}</p>
              </div>
              <button
                onClick={() => handleRemoveFavorite(fav._id)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}