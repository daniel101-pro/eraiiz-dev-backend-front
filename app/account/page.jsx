'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Bell, Settings, LogOut, User } from 'lucide-react';
import { refreshAccessToken } from '../utils/auth';
import MyEraiizAccount from '../components/account/MyEraiizAccount';
import Orders from '../components/account/Orders';
import FavoriteItems from '../components/account/FavoriteItems';
import Notifications from '../components/account/Notifications';
import SettingsSection from '../components/account/Settings';
import UploadedProducts from '../components/account/UploadedProducts'; // New component
import DualNavbarSell from '../components/DualNavbarSell';
import { useCart } from '../context/CartContext';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('My Eraiiz Account');
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const router = useRouter();
  const { clearCart } = useCart();

  const fetchUser = async (token) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const text = await res.text();
      console.log('Raw response:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Response is not valid JSON: ' + text);
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch user data', { cause: { status: res.status } });
      }
      setUser(data);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        let token = localStorage.getItem('accessToken');
        if (!token) {
          setShowModal(true);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        try {
          await fetchUser(token);
        } catch (err) {
          if (err.cause?.status === 401 || err.message.includes('Invalid or expired token')) {
            try {
              token = await refreshAccessToken();
              await fetchUser(token);
            } catch (refreshErr) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setShowModal(true);
              setTimeout(() => router.push('/login'), 2000);
              return;
            }
          } else {
            setError(err.message);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [router]);

  const handleLogout = () => {
    // Clear cart first
    clearCart();
    
    // Then clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const handleTokenError = () => {
    setShowModal(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 bg-green-100 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium animate-fadeIn">
            welcome to your account...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!user) return <div className="text-center">No user data found.</div>;

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center animate-fadeIn md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">A Gentle Reminder</h2>
            <p className="text-gray-600 mb-6">
              It seems your session has expired. Kindly log in anew to continue your journey with us.
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <DualNavbarSell handleLogout={handleLogout} />
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-16 md:w-64 bg-white border-r p-4 md:p-6">
          <div className="mb-4 md:mb-8">
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'My Eraiiz Account' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
              onClick={() => setActiveSection('My Eraiiz Account')}
            >
              <User className="h-4 w-4 text-green-600" />
              <span className="hidden md:inline text-sm font-medium text-green-600">My Eraiiz Account</span>
            </div>
          </div>
          <nav className="space-y-4 md:space-y-6 text-gray-700">
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'Orders' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
              onClick={() => setActiveSection('Orders')}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Orders</span>
            </div>
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'Favorite Items' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
              onClick={() => setActiveSection('Favorite Items')}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Favorite Items</span>
            </div>
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'Notifications' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
              onClick={() => setActiveSection('Notifications')}
            >
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Notifications</span>
            </div>
            <div
              className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'Settings' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
              onClick={() => setActiveSection('Settings')}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Settings</span>
            </div>
            {user.role === 'seller' && (
              <div
                className={`flex items-center justify-center gap-2 px-2 py-1 rounded cursor-pointer ${activeSection === 'Uploaded Products' ? 'bg-green-50' : ''} md:px-4 md:py-2 md:justify-start`}
                onClick={() => setActiveSection('Uploaded Products')}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden md:inline text-sm">Uploaded Products</span>
              </div>
            )}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded mt-4 w-full md:mt-40 md:w-[210px] md:px-4 md:py-2 md:justify-start"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </aside>

        <main className="flex-1 p-4 md:p-10">
          {activeSection === 'My Eraiiz Account' && <MyEraiizAccount user={user} setUser={setUser} onTokenError={handleTokenError} />}
          {activeSection === 'Orders' && <Orders onTokenError={handleTokenError} />}
          {activeSection === 'Favorite Items' && <FavoriteItems onTokenError={handleTokenError} />}
          {activeSection === 'Notifications' && <Notifications onTokenError={handleTokenError} />}
          {activeSection === 'Settings' && <SettingsSection onTokenError={handleTokenError} />}
          {activeSection === 'Uploaded Products' && user.role === 'seller' && <UploadedProducts onTokenError={handleTokenError} />}
        </main>
      </div>

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
    </>
  );
}