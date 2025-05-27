'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DualNavbar from '../components/DualNavbar';
import { Filter, Search } from 'lucide-react';

const FilterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 6h18v2H3V6zm3 4h12v2H6v-2zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
    <path d="M10 12h4v4h-4v-4z" />
  </svg>
);

export default function CategoriesPage() {
  useEffect(() => {
    document.title = 'Categories | Eraiz';
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 'plastic', name: 'Plastic Made Products', image: '/image11.png', itemCount: '1,256 items' },
    { id: 'rubber', name: 'Rubber Made Products', image: '/image3.png', itemCount: '1,256 items' },
    { id: 'glass', name: 'Glass Made Products', image: '/image22.png', itemCount: '1,256 items' },
    { id: 'wood', name: 'Wood Made Products', image: '/image4.png', itemCount: '1,256 items' },
    { id: 'palm-frond', name: 'Palm Frond Made Products', image: '/image5.png', itemCount: '1,256 items' },
    { id: 'recycled', name: 'General Recycled Items', image: '/image6.png', itemCount: '1,256 items' },
  ];

  const products = {
    plastic: new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image11.png' }).map((p, i) => ({ ...p, id: `p${i + 1}` })),
    rubber: new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image3.png' }).map((p, i) => ({ ...p, id: `r${i + 1}` })),
    glass: new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image22.png' }).map((p, i) => ({ ...p, id: `g${i + 1}` })),
    wood: new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image4.png' }).map((p, i) => ({ ...p, id: `w${i + 1}` })),
    'palm-frond': new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image5.png' }).map((p, i) => ({ ...p, id: `pf${i + 1}` })),
    recycled: new Array(4).fill({ name: 'Name of Item', price: '#350,000', rating: 4.2, reviews: '18,000', image: '/image6.png' }).map((p, i) => ({ ...p, id: `rc${i + 1}` })),
  };

  const handleExplore = (categoryId) => setSelectedCategory(categoryId);
  const handleBack = () => setSelectedCategory(null);

  return (
    <>
      <DualNavbar />      
      <div className="min-h-screen bg-white mt-6">
        {/* Updated Search Bar */}
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
        <div className="max-w-4xl mx-auto p-4">
          {!selectedCategory ? (
            <>
              <h2 className="text-m font-light text-gray-700 mb-4">All categories on Eraiiz</h2>
              <div className="space-y-4 ">
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
                      className="ml-4 px-4 py-2 bg-white border border-green-500 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition duration-200"
                    >
                      Explore →
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="mb-4 text-green-500 hover:underline">
                ← Back to categories
              </button>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {categories.find((cat) => cat.id === selectedCategory)?.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products[selectedCategory]?.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-3 border border-gray-200">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h3 className="mt-2 text-sm font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-green-600 font-bold">{product.price}</p>
                    <p className="text-xs text-gray-500">
                      ⭐ {product.rating} • {product.reviews} reviews
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}