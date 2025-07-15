'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { showAuthToast } from '../utils/toast';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user came from Google auth and has temporary data
    const tempUser = localStorage.getItem('tempGoogleUser');
    const tempTokens = localStorage.getItem('tempGoogleTokens');
    
    if (!tempUser || !tempTokens) {
      // If no temp data, redirect to login
      router.push('/login');
      return;
    }

    try {
      setUserData(JSON.parse(tempUser));
    } catch (error) {
      console.error('Error parsing temp user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      showAuthToast('Please select a role to continue', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const tempTokens = localStorage.getItem('tempGoogleTokens');
      if (!tempTokens) {
        throw new Error('No authentication data found');
      }

      const tokens = JSON.parse(tempTokens);

      // Update user role in backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role');
      }

      const updatedUser = await response.json();

      // Store final user data and tokens
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('role', updatedUser.role);

      // Clean up temporary data
      localStorage.removeItem('tempGoogleUser');
      localStorage.removeItem('tempGoogleTokens');

      showAuthToast(`Welcome! Your ${selectedRole} account is ready.`, 'success');

      // Redirect to welcome page then to dashboard
      router.push('/welcome');

    } catch (error) {
      console.error('Role selection error:', error);
      showAuthToast(error.message || 'Failed to set up your account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-white text-2xl font-bold">E</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Eraiiz, {userData.name}! 👋
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to use Eraiiz to get started
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Buyer Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('buyer')}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${
              selectedRole === 'buyer'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedRole === 'buyer' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <FaShoppingCart className={`text-2xl ${
                  selectedRole === 'buyer' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Buy</h3>
              <p className="text-gray-600 text-sm mb-4">
                Discover sustainable products and make eco-friendly purchases
              </p>
              <ul className="text-left text-sm text-gray-500 space-y-1">
                <li>• Browse sustainable products</li>
                <li>• Track your carbon footprint</li>
                <li>• Get personalized recommendations</li>
                <li>• Join the eco-community</li>
              </ul>
            </div>
            {selectedRole === 'buyer' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.div>

          {/* Seller Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('seller')}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${
              selectedRole === 'seller'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedRole === 'seller' ? 'bg-green-500' : 'bg-gray-100'
              }`}>
                <FaStore className={`text-2xl ${
                  selectedRole === 'seller' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Sell</h3>
              <p className="text-gray-600 text-sm mb-4">
                List and sell your sustainable products to eco-conscious buyers
              </p>
              <ul className="text-left text-sm text-gray-500 space-y-1">
                <li>• Upload sustainable products</li>
                <li>• Reach eco-conscious customers</li>
                <li>• Track sales analytics</li>
                <li>• Build your green business</li>
              </ul>
            </div>
            {selectedRole === 'seller' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: selectedRole ? 1.02 : 1 }}
          whileTap={{ scale: selectedRole ? 0.98 : 1 }}
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            selectedRole && !isLoading
              ? selectedRole === 'buyer'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              Setting up your account...
            </div>
          ) : selectedRole ? (
            `Continue as ${selectedRole === 'buyer' ? 'Buyer' : 'Seller'}`
          ) : (
            'Select a role to continue'
          )}
        </motion.button>

        {/* Switch Option */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            You can always switch between buyer and seller modes later in your account settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
} 