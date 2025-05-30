'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, User, ChevronDown, Search, Filter, Menu, X } from 'lucide-react';

export default function DualNavbarSell({ handleLogout }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [debounceTimeout, setDebounceTimeout] = useState(null);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isSidebarOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setIsFilterOpen(false);
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '' });
    setIsFilterOpen(false);
  };

  const fetchProducts = useCallback(async (query, filters) => {
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.set('search', query);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSearchResults([]);
    }
  }, []);

  const debounceSearch = useCallback((query, filters) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      fetchProducts(query, filters);
    }, 300);

    setDebounceTimeout(timeout);
  }, [debounceTimeout, fetchProducts]);

  useEffect(() => {
    debounceSearch(searchQuery, filters);
  }, [searchQuery, filters, debounceSearch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      {/* Single Navbar for Mobile sellers */}
      <header className="md:hidden border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar}>
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <button onClick={handleLogoClick} className="text-xl font-bold text-green-600 flex items-center">
              Eraiiz<span className="ml-1">🌱</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-gray-600 hover:text-green-600">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-green-600">
              <User className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full">NG</span>
              <ChevronDown className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Modal for Mobile */}
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
            <button onClick={toggleSidebar}>
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search item or product codes..."
                className="pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Button in Sidebar */}
            <button
              onClick={toggleFilter}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>

            {/* Filter Modal in Sidebar */}
            {isFilterOpen && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Category</label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="mt-1 p-2 border rounded-md text-sm w-full"
                    >
                      <option value="">All Categories</option>
                      <option value="plastic">Plastic Made Products</option>
                      <option value="glass">Glass Made Products</option>
                      <option value="fruits-waste">Fruits Waste Products</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-md text-sm w-full"
                      />
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-md text-sm w-full"
                      />
                    </div>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Search Results in Sidebar */}
            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-100"
                    onClick={toggleSidebar}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

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
          </div>
        </div>
      </div>

      {/* Dual Navbar for Desktop */}
      <div className="hidden md:block">
        {/* Top Navbar */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={handleLogoClick} className="text-xl font-bold text-green-600 flex items-center">
                Eraiiz<span className="ml-1">🌱</span>
              </button>
              <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <Link href="/about" className="hover:text-green-600">About Eraiiz</Link>
                <Link href="/contact" className="hover:text-green-600">Contact Support</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="text-gray-600 hover:text-green-600">
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Link href="/account" className="text-gray-600 hover:text-green-600">
                <User className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1 text-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full">NG</span>
                <ChevronDown className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Bottom Navbar */}
        <nav className="border-b relative">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <nav className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/category/plastic" className="hover:text-green-600">Plastic Made Products</Link>
              <Link href="/category/glass" className="hover:text-green-600">Glass Made Products</Link>
              <Link href="/category/fruits-waste" className="hover:text-green-600">Fruits Waste Products</Link>
              <Link href="/categories" className="hover:text-green-600">Others</Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search item or product codes..."
                  className="pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={toggleFilter}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                >
                  <Filter className="h-4 w-4" /> Filters
                </button>
                {/* Filter Dropdown for Desktop */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Category</label>
                        <select
                          name="category"
                          value={filters.category}
                          onChange={handleFilterChange}
                          className="mt-1 p-2 border rounded-md text-sm w-full"
                        >
                          <option value="">All Categories</option>
                          <option value="plastic">Plastic Made Products</option>
                          <option value="glass">Glass Made Products</option>
                          <option value="fruits-waste">Fruits Waste Products</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Price Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="minPrice"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md text-sm w-full"
                          />
                          <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md text-sm w-full"
                          />
                        </div>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-sm text-green-600 hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Results Dropdown for Desktop */}
          {searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex items-center gap-3 p-3 border-b hover:bg-gray-100"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}