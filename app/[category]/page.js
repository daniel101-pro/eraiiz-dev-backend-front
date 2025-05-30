'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Search } from 'lucide-react';
import axios from 'axios';
import DualNavbarSell from '../components/DualNavbarSell';

const validCategories = {
  plastic: 'Plastic Made Products',
  glass: 'Glass Made Products',
  rubber: 'Rubber Made Products',
  wood: 'Wood Made Products',
  'palm-frond': 'Palm Frond Made Products',
  recycled: 'General Recycled Items',
};

export default function CategoryPage({ params }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { category: categoryId } = use(params); // Unwrap params with use()
  const categoryName = validCategories[categoryId];

  useEffect(() => {
    document.title = `${categoryName || 'Category'} | Eraiz`;
    if (!categoryName) {
      setError('Invalid category');
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
          params: { category: categoryName },
          timeout: 30000,
        });
        console.log(`Client: ${categoryName} Products Response:`, response.data);
        setProducts(
          response.data.map((product) => {
            let image = '/placeholder.png';
            if (product.images && product.images.length > 0) {
              image = product.images[0];
              if (!image.match(/\.(jpg|jpeg|png|gif)$/i)) {
                image = `${image}.png`;
              }
            }
            console.log(`Client: Product ${product.name} Image URL:`, image);
            return {
              id: product._id,
              name: product.name,
              price: `₦${product.price.toLocaleString()}`,
              rating: 4.2, // Mocked
              reviews: '18,000', // Mocked
              image,
              imageError: false,
            };
          }),
        );
      } catch (err) {
        console.error(`Client: ${categoryName} Fetch Error:`, err.response?.data || err.message);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (!loading && !error && !categoryName) {
    return (
      <div className="min-h-screen bg-white mt-4">
        <p className="text-red-600 text-center">Invalid category</p>
        <Link href="/categories" className="block text-center text-green-500 hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

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
        <div className="max-w-4xl mx-auto p-4">
          <Link href="/categories" className="mb-4 text-green-500 hover:underline block">
            ← Back to categories
          </Link>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{categoryName}</h2>
          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">No products found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-3 border border-gray-200">
                  {product.imageError ? (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-gray-500 text-sm">Image failed to load</span>
                    </div>
                  ) : (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                      priority={true} // Load images eagerly for debugging
                      unoptimized={true} // Bypass optimization for debugging
                      onError={(e) => {
                        console.error(`Client: Failed to load image for ${product.name}: ${product.image}`);
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id ? { ...p, imageError: true } : p,
                          ),
                        );
                      }}
                    />
                  )}
                  <h3 className="mt-2 text-sm font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-green-600 font-bold">{product.price}</p>
                  <p className="text-xs text-gray-500">
                    ⭐ {product.rating} • {product.reviews} reviews
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}