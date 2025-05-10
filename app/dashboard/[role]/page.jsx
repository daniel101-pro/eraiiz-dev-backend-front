'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { role } = useParams(); // Captures 'buyer' or 'seller' from the URL

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      // Validate that the role in the URL is valid ('buyer' or 'seller')
      const validRoles = ['buyer', 'seller'];
      if (!validRoles.includes(role)) {
        router.replace('/dashboard/buyer'); // Default to buyer if role is invalid
        return;
      }
      // Redirect if the URL's role doesn't match the user's actual role
      if (storedUser.role && storedUser.role !== role) {
        router.replace(`/dashboard/${storedUser.role}`);
      }
      setLoading(false);
    } else {
      // If no user is logged in, redirect to login
      router.push('/login');
    }
  }, [role, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-200">
        <p className="text-emerald-700 text-lg">Loading...</p>
      </div>
    );
  }

  // At this point, the redirect should have happened if roles don't match.
  // The specific dashboard (buyer/page.jsx or seller/page.jsx) will render.
  return null;
}