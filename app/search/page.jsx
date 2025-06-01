'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DualNavbarSell from '../../components/DualNavbarSell';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
        }

        const response = await fetch(`${apiUrl}/api/auth/session`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Session validation failed: ${response.status} ${response.statusText} - ${errorText || 'No error details'}`
          );
        }

        const data = await response.json();
        if (data.role !== 'seller') {
          throw new Error('Unauthorized: User is not a seller');
        }

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setLoading(false);
      } catch (err) {
        console.error('Session error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
      }
    };

    fetchSession();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Redirecting to login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DualNavbarSell handleLogout={() => router.push('/logout')} />
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p>Welcome, {user.name || 'Seller'}!</p>
        {/* Add more dashboard content here */}
      </main>
    </div>
  );
}