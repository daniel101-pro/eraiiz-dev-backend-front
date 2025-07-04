'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import CategoriesSection from '../../components/CategoriesSection';
import DualNavbarSell from '../../components/DualNavbarSell';
import ProductCard from '../../components/ProductCard';
import HeroCarousel from '../../components/HeroCarousel';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productsForYou, setProductsForYou] = useState([]);
  const [favoritedProducts, setFavoritedProducts] = useState(new Map());
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
        }

        const res = await axios.get(`${apiUrl}/api/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
          withCredentials: true,
        });

        if (res.data.role === 'seller') {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          setLoading(false);
        } else {
          router.push(`/dashboard/${res.data.role || 'buyer'}`);
        }
      } catch (err) {
        console.error('Session error:', {
          message: err.message,
          response: err.response?.data || 'No response data',
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
        if (err.response?.status === 401) {
          await refreshToken();
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    };
    fetchSession();
  }, [router]);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(`${apiUrl}/api/auth/refresh`, { refreshToken }, {
        timeout: 30000,
        withCredentials: true,
      });

      const newAccessToken = res.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      await fetchSession();
    } catch (err) {
      console.error('Token refresh error:', err);
      localStorage.clear();
      router.push('/login');
    }
  };

  useEffect(() => {
    const fetchProductsForYou = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
        }

        const res = await axios.get(`${apiUrl}/api/products/random?limit=8`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          timeout: 30000,
        });
        setProductsForYou(res.data);
      } catch (err) {
        console.error('Error fetching products for you:', {
          message: err.message,
          response: err.response?.data || 'No response data',
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
      }
    };
    fetchProductsForYou();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${apiUrl}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
          withCredentials: true,
        });
        const favoriteMap = new Map(
          res.data.map((fav) => [fav.productId, fav._id])
        );
        setFavoritedProducts(favoriteMap);
      } catch (err) {
        console.error('Error fetching favorites:', {
          message: err.message,
          response: err.response?.data || 'No response data',
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
        toast.error('Failed to load favorites. Some features may not work as expected.', {
          id: 'fetch-favorites-error',
          duration: 3000,
          position: 'top-center',
        });
        setFavoritedProducts(new Map());
      }
    };
    fetchFavorites();
  }, []);

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
      }

      await axios.post(`${apiUrl}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        timeout: 30000,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 bg-green-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DualNavbarSell
        handleLogout={handleLogout}
        toggleSidebar={() => {}}
        productsForYou={productsForYou}
      />
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
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <HeroCarousel />

          <div className="flex justify-center mb-12">
            <Link href="/dashboard/seller/upload">
              <button
                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition font-semibold"
              >
                Upload Product
              </button>
            </Link>
          </div>

          <CategoriesSection />

          <div className="mt-12 mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Products for You</h2>
              <Link href="/for-you">
                <button className="flex items-center gap-1 px-4 py-1.5 bg-[#F8FFF8] border border-[#CDEFCB] text-gray-700 rounded-xl text-sm font-medium">
                  See all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </Link>
            </div>
            {productsForYou.length === 0 ? (
              <p className="text-gray-600">No products available at the moment.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {productsForYou.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center border-t border-gray-200 pt-4 mb-4 text-xs text-gray-500">
            © {new Date().getFullYear()} ERaiiz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}