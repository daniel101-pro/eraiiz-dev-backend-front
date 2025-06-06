import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../app/utils/auth';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="bg-white rounded-lg">
      {products.length === 0 ? (
        <p className="text-gray-700 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Price:</strong> {product.price}</p>
              <button
                onClick={() => handleAddToFavorites(product._id)}
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Add to Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}