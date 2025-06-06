'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, ChevronDown, Search, Filter, Menu, Heart } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoriesSection from '../../components/CategoriesSection';
import DualNavbarSell from '../../components/DualNavbarSell';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsForYou, setProductsForYou] = useState([]);
  const [favoritedProducts, setFavoritedProducts] = useState(new Map());
  const [imageError, setImageError] = useState(null);
  const router = useRouter();

  const carouselItems = [
    {
      image: '/plastic-products.png',
      alt: 'Plastic Made Products',
      title: 'Plastic Made Chairs',
      subtitle: 'Discover a range of innovative and sustainable products crafted from recycled plastics.',
      link: '/category/plastic',
    },
    {
      image: '/glass-products.png',
      alt: 'Glass Made Products',
      title: 'Glass Made Chairs',
      subtitle: 'Explore the beauty of sustainability with our Glass Made Products, combining elegance with eco-consciousness.',
      link: '/category/glass',
    },
    {
      image: '/recycled-products.png',
      alt: 'Fruits Waste Products',
      title: 'Fruits Waste Chairs',
      subtitle: 'Discover innovation in every piece with our Recycled Products — turning waste into purposeful beauty.',
      link: '/category/fruits-waste',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

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
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: '#F44336',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
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

  const handleAddToFavorites = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined');
      }

      const favoriteId = favoritedProducts.get(productId);
      const isFavorited = !!favoriteId;

      setFavoritedProducts((prev) => {
        const updated = new Map(prev);
        if (isFavorited) {
          updated.delete(productId);
        } else {
          updated.set(productId, 'temp');
        }
        return updated;
      });

      if (isFavorited) {
        await axios.delete(`${apiUrl}/api/favorites/${favoriteId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
          withCredentials: true,
        });
      } else {
        const res = await axios.post(`${apiUrl}/api/favorites/${productId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
          withCredentials: true,
        });
        setFavoritedProducts((prev) => {
          const updated = new Map(prev);
          updated.set(productId, res.data._id);
          return updated;
        });
      }

      toast.success(isFavorited ? 'Removed from favorites!' : 'Added to favorites!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#4CAF50',
          color: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (err) {
      console.error('Add to favorites error:', {
        message: err.message || 'Unknown error',
        response: err.response ? err.response.data : 'No response data',
        status: err.response ? err.response.status : 'No status',
        statusText: err.response ? err.response.statusText : 'No status text',
        productId,
        stack: err.stack || 'No stack trace',
      });

      setFavoritedProducts((prev) => {
        const updated = new Map(prev);
        const isFavorited = prev.has(productId);
        if (isFavorited) {
          updated.set(productId, prev.get(productId));
        } else {
          updated.delete(productId);
        }
        return updated;
      });

      toast.error(`Failed to update favorites: ${err.response?.data?.message || err.message || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#F44336',
          color: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
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
          <p className="text-gray-600 text-lg font-medium animate-fadeIn">
            welcome to your seller dashboard...
          </p>
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
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <div
              className="flex transition-transform duration-500 ease-in-out mb-4"
              style={{ transform: `translateX(-${currentIndex * (100 / (window.innerWidth >= 768 ? 2 : 1))}%)` }}
            >
              {carouselItems.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full md:w-1/2 flex flex-col md:flex-row md:items-center p-2 md:mr-4"
                >
                  <div className="relative w-full h-80 rounded-l-lg overflow-hidden md:block" style={{ position: 'relative' }}>
                    <Image
                      src={item.image}
                      alt={item.alt}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-l-lg"
                      draggable={false}
                      onError={() => setImageError(`Failed to load image: ${item.image}`)}
                    />
                    <Link href={item.link} className="md:hidden block w-full h-full">
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent text-white rounded-b-lg">
                        <h2 className="text-xl font-bold">{item.title}</h2>
                        <p className="text-sm">{item.subtitle}</p>
                      </div>
                    </Link>
                  </div>
                  <div className="hidden md:flex flex-col justify-center md:mt-0 md:flex-[0_0_40%] md:pl-4 h-80 border border-gray-200 md:border-l md:border-r md:rounded-r-lg md:flex-row md:items-center">
                    <div className="md:flex-1">
                      <h2 className="text-2xl font-medium text-black mb-4">{item.title}</h2>
                      <p className="text-sm -mt-1 text-gray-500 mb-4 md:mb-0">{item.subtitle}</p>
                      <Link href={item.link}>
                        <button
                          className="bg-green-600 mt-32 text-white px-6 py-2 rounded-md hover:bg-green-700 transition w-fit"
                        >
                          Learn More
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-green-600' : 'bg-gray-200'}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
            {imageError && <p className="text-red-600 text-center mt-4">{imageError}</p>}
          </div>

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
              <h2 className="text-2xl font-semibold text-gray-800">Products for You</h2>
              <Link href="/for-you">
                <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
                  See All
                </button>
              </Link>
            </div>
            {productsForYou.length === 0 ? (
              <p className="text-gray-600">No products available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {productsForYou.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition relative">
                    <Link href={`/product/${product._id}`}>
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded"
                      />
                      <h3 className="mt-2 text-sm font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Category: {product.category}</p>
                    </Link>
                    <button
                      onClick={() => handleAddToFavorites(product._id)}
                      className="absolute top-2 right-2 transition-colors"
                    >
                      <Heart
                        size={20}
                        fill={favoritedProducts.has(product._id) ? 'red' : 'none'}
                        className={favoritedProducts.has(product._id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}
                      />
                    </button>
                  </div>
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

      <ToastContainer />
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in forwards;
        }
      `}</style>
    </div>
  );
}