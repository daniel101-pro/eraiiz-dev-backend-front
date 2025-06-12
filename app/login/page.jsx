'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import GoogleAuthButton from '../components/GoogleAuthButton';
import toast from 'react-hot-toast';

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
      toast.success('Successfully logged in!');
      router.push(`/dashboard/${data.user.role}`);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid credentials');
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative z-10 mb-10">
        <Navbar />
      </div>
    
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col custom-md:flex-row items-center justify-center">
          <div className="w-full custom-md:w-1/2 p-6 flex items-center justify-center">
            <div className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Login to Eraiiz</h2>
              <p className="text-center text-gray-500 mb-6">
                Sign in to your account to continue buying or selling with Eraiiz.
              </p>
              
              <GoogleAuthButton text="Sign in with Google" />
              
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
                  Don't have an account? <a href="/signup" className="text-green-600 hover:underline">Sign up here</a>
                </p>
              </form>
            </div>
          </div>

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
    </>
  );
}