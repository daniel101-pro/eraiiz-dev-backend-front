'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import DualNavbarSell from '../components/DualNavbarSell';

const NotFoundPage = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // You can also fetch from cookies, context, etc.
    const storedRole = localStorage.getItem('role'); // Assume 'buyer', 'seller', etc.
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const dashboardHref = role ? `/dashboard/${role}` : '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <DualNavbarSell />

      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Oops! Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href={dashboardHref}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Dashboard
          </Link>

          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Search className="h-5 w-5" />
            Search Products
          </Link>
        </div>
      </div>

      <footer className="border-t py-4 text-center text-sm text-gray-600">
        <p>
          &copy; 2025 Eraiiz 🌱 |{' '}
          <Link href="/contact" className="text-green-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
