'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-emerald-700">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition duration-200 font-semibold"
          >
            Reset Password
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.includes('successful') ? 'text-emerald-700' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}