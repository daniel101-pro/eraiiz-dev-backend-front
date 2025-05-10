'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Icons
const ListingsIcon = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10h6m-6 0V7m6 0H9m-4 7h14" />
  </svg>
);

const SalesIcon = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-4c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0-4C6.5 0 2 4.5 2 10s4.5 10 10 10 10-4.5 10-10S17.5 0 12 0z" />
  </svg>
);

const ViewsIcon = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'seller') {
      setUser(storedUser);
      setLoading(false);
    } else {
      router.push(`/dashboard/${storedUser?.role || 'buyer'}`);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/delete-account', {
        email: user.email,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-200">
        <p className="text-emerald-700 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-200 to-green-100">
      <nav className="bg-emerald-800 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Eraiiz Seller Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user.name || 'EcoVendor'}</span>
        </div>
      </nav>

      <div className="flex-grow p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">
            Welcome back, {user.name || 'EcoVendor'} 🌱
          </h1>
          <p className="text-md text-emerald-700 italic">
            Your sustainable listings empower change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow">
            <ListingsIcon />
            <div>
              <h2 className="text-lg font-semibold text-emerald-600">Active Listings</h2>
              <p className="text-3xl font-bold text-emerald-900">15</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow">
            <SalesIcon />
            <div>
              <h2 className="text-lg font-semibold text-emerald-600">Sales</h2>
              <p className="text-3xl font-bold text-emerald-900">₦120,000</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow">
            <ViewsIcon />
            <div>
              <h2 className="text-lg font-semibold text-emerald-600">Total Views</h2>
              <p className="text-3xl font-bold text-emerald-900">1,245</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-emerald-700 text-white rounded-xl p-6 flex items-center gap-4 hover:scale-105 hover:bg-emerald-800 transition transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <div>
              <h3 className="text-xl font-bold">Add New Listing</h3>
              <p className="text-sm">Share your sustainable products with the world.</p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white rounded-xl p-6 flex items-center gap-4 hover:scale-105 hover:bg-emerald-700 transition transform border-4 border-emerald-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10h6m-6 0V7m6 0H9m-4 7h14" />
            </svg>
            <div>
              <h3 className="text-xl font-bold">Manage Listings</h3>
              <p className="text-sm">Update, track, or remove your eco-offers.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-emerald-900 italic text-lg">
          “The greatest threat to our planet is the belief that someone else will save it.” — Robert Swan
        </div>
      </div>

      <footer className="bg-emerald-900 text-white p-6 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition"
          >
            Logout
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
          >
            Delete Account
          </button>
        </div>
        <p className="text-sm italic">
          "Together, we can make sustainability a reality." — Eraiiz Team
        </p>
        <p className="text-xs">© {new Date().getFullYear()} Eraiiz. All rights reserved.</p>
      </footer>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}