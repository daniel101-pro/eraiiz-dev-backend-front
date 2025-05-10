'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';

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
        { timeout: 30000 } // 30-second timeout
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-200">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-emerald-800 mb-4">Login to Eraiiz</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-emerald-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-emerald-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition duration-200 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size={20} color="#ffffff" /> : 'Login'}
        </button>
        <p className="mt-4 text-center text-emerald-700">
          Forgot Password? <a href="/reset-password" className="underline">Reset here</a>
        </p>
      </form>
    </div>
  );
}