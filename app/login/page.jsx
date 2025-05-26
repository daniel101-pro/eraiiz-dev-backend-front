'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Calling backend at:', process.env.NEXT_PUBLIC_API_URL + '/api/auth/login');
    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + '/api/auth/login',
        { email, password },
        { timeout: 30000 }
      );
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('role', data.user.role);
      router.push(`/dashboard/${data.user.role}`);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="w-full bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-600">Erailz</div>
        <div className="space-x-4 text-gray-600">
          <a href="#" className="hover:text-green-600">About Eraiz</a>
          <a href="#" className="hover:text-green-600">Become a Supplier</a>
          <a href="#" className="hover:text-green-600">Help</a>
          <a href="#" className="hover:text-green-600">Contact Support</a>
          <span className="text-green-600">NG</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col custom-md:flex-row items-center justify-center">
        {/* Left Side - Login Form */}
        <div className="w-full custom-md:w-1/2 p-6 flex items-center justify-center">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Login to Eraiz</h2>
            <p className="text-center text-gray-500 mb-6">
              Sign in to your account to continue buying or selling with Eraiz.
            </p>
            <button className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg mb-4 flex items-center justify-center hover:bg-gray-50 transition duration-200 shadow-sm">
              <FcGoogle className="mr-2 text-xl" /> Sign in with Google
            </button>
            <div className="text-center text-gray-400 mb-4">Or</div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-center">{error}</p>}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size={20} color="#ffffff" /> : 'Login'}
              </button>
              <p className="text-center text-gray-600">
                Forgot Password? <a href="/reset-password" className="text-green-600 hover:underline">Reset here</a>
              </p>
              <p className="text-center text-gray-600">
                Don’t have an account? <a href="/signup" className="text-green-600 hover:underline">Sign up here</a>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Image (Hidden on screens < 1000px) */}
        <div className="hidden custom-md:flex custom-md:w-1/2 p-6 bg-white border-l border-gray-200 items-center justify-center">
          <div className="relative w-full h-[calc(100vh-100px)]">
            <Image
              src="/signupright.png"
              alt="login-right"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}