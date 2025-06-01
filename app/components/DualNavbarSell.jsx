'use client';

// Imports from Next.js and React
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// Icons from lucide-react
import { ShoppingCart, User, ChevronDown, Search, Filter, Menu, X } from 'lucide-react';

// Component: DualNavbarSell for mobile and desktop navigation
export default function DualNavbarSell({ handleLogout }) {
  const router = useRouter();

  // State for sidebar and filter visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle logo click to redirect based on user role
  const handleLogoClick = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const role = parsedUser?.role || 'buyer';
        router.push(`/dashboard/${role}`);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    if (isSidebarOpen) {
      setIsFilterOpen(false);
    }
  };

  // Toggle filter visibility (for redirect preparation)
  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // Handle search redirect
  const handleSearchRedirect = () => {
    router.push('/search');
  };

  // Handle filter redirect with parameters (to be implemented on /search page)
  const handleFilterRedirect = () => {
    // This will be handled on the /search page; for now, redirect without params
    router.push('/search');
  };

  return (
    <>
      {/* Mobile Navbar */}
      <header className="md:hidden border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} aria-label="Open Sidebar">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button onClick={handleLogoClick} className="text-xl font-bold text-green-600 flex items-center">
              Eraiiz<span className="ml-1">🌱</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSearchRedirect} aria-label="Search" className="text-gray-600 hover:text-green-600">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/cart" className="text-gray-600 hover:text-green-600" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-green-600" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full">
                NG
              </span>
              <ChevronDown className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>

        {/* Sidebar Content */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <button onClick={handleLogoClick} className="text-xl font-bold text-green-600 flex items-center">
              Eraiiz<span className="ml-1">🌱</span>
            </button>
            <button onClick={toggleSidebar} aria-label="Close Sidebar">
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {/* Top Navbar Links */}
            <nav className="flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/about" className="hover:text-green-600" onClick={toggleSidebar}>
                About Eraiiz
              </Link>
              <Link href="/help" className="hover:text-green-600" onClick={toggleSidebar}>
                Help
              </Link>
              <Link href="/contact" className="hover:text-green-600" onClick={toggleSidebar}>
                Contact Support
              </Link>
            </nav>

            {/* Divider */}
            <hr className="my-2 border-gray-200" />

            {/* Bottom Navbar Links */}
            <nav className="flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/category/plastic" className="hover:text-green-600" onClick={toggleSidebar}>
                Plastic Made Products
              </Link>
              <Link href="/category/glass" className="hover:text-green-600" onClick={toggleSidebar}>
                Glass Made Products
              </Link>
              <Link href="/category/fruits-waste" className="hover:text-green-600" onClick={toggleSidebar}>
                Fruits Waste Products
              </Link>
              <Link href="/categories" className="hover:text-green-600" onClick={toggleSidebar}>
                Others
              </Link>
            </nav>

            {/* Search and Filter Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSearchRedirect}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Go to Search Page"
              >
                <Search className="h-4 w-4" /> Search
              </button>
              <button
                onClick={handleFilterRedirect}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Go to Filter Page"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Dual Navbar */}
      <div className="hidden md:block">
        {/* Top Navbar */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={handleLogoClick} className="text-xl font-bold text-green-600 flex items-center">
                Eraiiz<span className="ml-1">🌱</span>
              </button>
              <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <Link href="/about" className="hover:text-green-600">
                  About Eraiiz
                </Link>
                <Link href="/contact" className="hover:text-green-600">
                  Contact Support
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleSearchRedirect} aria-label="Search" className="text-gray-600 hover:text-green-600">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/cart" className="text-gray-600 hover:text-green-600" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Link href="/account" className="text-gray-600 hover:text-green-600" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1 text-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full">
                  NG
                </span>
                <ChevronDown className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Bottom Navbar */}
        <nav className="border-b">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <nav className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/category/plastic" className="hover:text-green-600">
                Plastic Made Products
              </Link>
              <Link href="/category/glass" className="hover:text-green-600">
                Glass Made Products
              </Link>
              <Link href="/category/fruits-waste" className="hover:text-green-600">
                Fruits Waste Products
              </Link>
              <Link href="/categories" className="hover:text-green-600">
                Others
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={handleFilterRedirect}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Go to Filter Page"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}