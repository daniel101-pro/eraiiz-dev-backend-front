'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DualNavbarSell from '../components/DualNavbarSell';
import ProductsForYou from '../components/ProductsForYou';
import { Filter, Search } from 'lucide-react';
import axios from 'axios';

const FilterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 6h18v2H3V6zm3 4h12v2H6v-2zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
    <path d="M10 12h4v4h-4v-4z" />
  </svg>
);

export default function CategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Categories | Eraiz';
  }, []);

  const [categories, setCategories] = useState([
    { id: 'plastic', name: 'Plastic Made Products', image: '/image11.png', itemCount: 'Loading...' },
    { id: 'rubber', name: 'Rubber Made Products', image: '/image3.png', itemCount: 'Loading...' },
    { id: 'glass', name: 'Glass Made Products', image: '/image22.png', itemCount: 'Loading...' },
    { id: 'wood', name: 'Wood Made Products', image: '/image4.png', itemCount: 'Loading...' },
    { id: 'palm-frond', name: 'Palm Frond Made Products', image: '/image5.png', itemCount: 'Loading...' },
    { id: 'recycled', name: 'General Recycled Items', image: '/image6.png', itemCount: 'Loading...' },
  ]);

  // Fetch product counts
  useEffect(() => {
    const fetchProductCounts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/count`, {
          timeout: 30000,
        });
        console.log('Client: Product Counts Response:', response.data);
        const updatedCategories = categories.map((cat) => {
          const countData = response.data.find((item) => item.category === cat.name);
          return {
            ...cat,
            itemCount: countData ? `${countData.count.toLocaleString()} items` : '0 items',
          };
        });
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Client: Product Counts Error:', error.response?.data || error.message);
        setCategories(categories.map((cat) => ({ ...cat, itemCount: 'Error' })));
      }
    };
    fetchProductCounts();
  }, []);

  const handleExplore = (categoryId) => {
    router.push(`/categories/${categoryId}`);
  };

  return (
    <>
      <DualNavbarSell />
      <div className="min-h-screen bg-white mt-6">
        {/* Search Bar */}
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2 shadow-sm">
            <Search className="mr-5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search item or product code..."
              className="flex-grow bg-transparent outline-none text-sm text-gray-600 placeholder:text-gray-400"
            />
            <button className="ml-2 p-1.5 rounded-full text-gray-600 hover:bg-gray-200 transition">
              <Filter />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto p-4">
          <h2 className="text-m font-light text-gray-700 mb-4">All categories on Eraiiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition duration-200"
              >
                <div className="w-16 h-16 mr-4">
                  <Image
                    src={category.image}
                    alt={`${category.name} image`}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-light text-gray-800">{category.name}</h3>
                  <p className="text-xs text-gray-600">{category.itemCount}</p>
                </div>
                <button
                  onClick={() => handleExplore(category.id)}
                  className="ml-4 flex items-center gap-1 px-4 py-1.5 bg-[#F8FFF8] border border-[#CDEFCB] text-gray-700 rounded-xl text-sm font-medium hover:bg-[#ECF9EC] transition"
                >
                  Explore
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            ))}
          </div>
          <ProductsForYou limit={8} />
        </div>
      </div>
    </>
  );
}