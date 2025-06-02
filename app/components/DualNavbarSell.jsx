'use client';

// Imports from Next.js and React
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// Icons from lucide-react
import { ShoppingCart, User, ChevronDown, Search, Filter, Menu, X } from 'lucide-react';

export default function DualNavbarSell({ handleLogout }) {
  const router = useRouter();

  // State for sidebar, filter modal, and filter settings
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    minRating: '',
  });

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
      setIsFilterModalOpen(false);
    }
  };

  // Toggle filter modal visibility
  const toggleFilterModal = () => {
    setIsFilterModalOpen((prev) => !prev);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Handle filter settings change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilterSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle filter submission
  const handleFilterSubmit = () => {
    const params = new URLSearchParams();
    if (filterSettings.category) params.append('category', filterSettings.category);
    if (filterSettings.minPrice) params.append('minPrice', filterSettings.minPrice);
    if (filterSettings.maxPrice) params.append('maxPrice', filterSettings.maxPrice);
    if (filterSettings.inStock) params.append('inStock', 'true');
    if (filterSettings.minRating) params.append('minRating', filterSettings.minRating);

    router.push(`/filter?${params.toString()}`);
    setIsFilterModalOpen(false);
  };

  // Handle search redirect
  const handleSearchRedirect = () => {
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
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>

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
              <Link href="/supplier" className="hover:text-green-600" onClick={toggleSidebar}>
                Become a Supplier
              </Link>
            </nav>

            <hr className="my-2 border-gray-200" />

            <nav className="flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/categories/plastic" className="hover:text-green-600" onClick={toggleSidebar}>
                Plastic Made Products
              </Link>
              <Link href="/categories/glass" className="hover:text-green-600" onClick={toggleSidebar}>
                Glass Made Products
              </Link>
              <Link href="/categories/rubber" className="hover:text-green-600" onClick={toggleSidebar}>
                Rubber Made Products
              </Link>
              <Link href="/categories/wood" className="hover:text-green-600" onClick={toggleSidebar}>
                Wood Made Products
              </Link>
              <Link href="/categories/palm-frond" className="hover:text-green-600" onClick={toggleSidebar}>
                Palm Frond Made Products
              </Link>
              <Link href="/categories/recycled" className="hover:text-green-600" onClick={toggleSidebar}>
                General Recycled Items
              </Link>
              <Link href="/categories/fruits" className="hover:text-green-600" onClick={toggleSidebar}>
                Fruits Waste Products
              </Link>
              <Link href="/categories" className="hover:text-green-600" onClick={toggleSidebar}>
                Others
              </Link>
            </nav>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSearchRedirect}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Go to Search Page"
              >
                <Search className="h-4 w-4" /> Search
              </button>
              <button
                onClick={toggleFilterModal}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Open Filter Modal"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Dual Navbar */}
      <div className="hidden md:block">
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

        <nav className="border-b">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <nav className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/categories/plastic" className="hover:text-green-600">
                Plastic Made Products
              </Link>
              <Link href="/categories/glass" className="hover:text-green-600">
                Glass Made Products
              </Link>
              <Link href="/categories/rubber" className="hover:text-green-600">
                Rubber Made Products
              </Link>
              <Link href="/categories/wood" className="hover:text-green-600">
                Wood Made Products
              </Link>
              <Link href="/categories/palm-frond" className="hover:text-green-600">
                Palm Frond Made Products
              </Link>
              <Link href="/categories/recycled" className="hover:text-green-600">
                General Recycled Items
              </Link>
              <Link href="/categories/fruits" className="hover:text-green-600">
                Fruits Waste Products
              </Link>
              <Link href="/categories" className="hover:text-green-600">
                Others
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFilterModal}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                aria-label="Open Filter Modal"
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Filter Products</h2>
              <button onClick={toggleFilterModal} aria-label="Close Filter Modal">
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filterSettings.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                >
                  <option value="">All Categories</option>
                  <option value="Plastic Made Products">Plastic Made Products</option>
                  <option value="Rubber Made Products">Rubber Made Products</option>
                  <option value="Glass Made Products">Glass Made Products</option>
                  <option value="Wood Made Products">Wood Made Products</option>
                  <option value="Palm Frond Made Products">Palm Frond Made Products</option>
                  <option value="General Recycled Items">General Recycled Items</option>
                  <option value="Fruits Waste Products">Fruits Waste Products</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price Range (₦)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filterSettings.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min Price"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filterSettings.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max Price"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  name="inStock"
                  checked={filterSettings.inStock}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                  In Stock Only
                </label>
              </div>

              <div>
                <label htmlFor="minRating" className="block text-sm font-medium text-gray-700">
                  Minimum Rating
                </label>
                <select
                  id="minRating"
                  name="minRating"
                  value={filterSettings.minRating}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600"
                >
                  <option value="">Any Rating</option>
                  <option value="1">1 Star & Up</option>
                  <option value="2">2 Stars & Up</option>
                  <option value="3">3 Stars & Up</option>
                  <option value="4">4 Stars & Up</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={toggleFilterModal}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFilterSubmit}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}