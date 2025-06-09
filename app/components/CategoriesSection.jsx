'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import axios from 'axios';

export default function CategoriesSection() {
  const [categories, setCategories] = useState([
    {
      name: "Plastic Made Products",
      count: "Loading...",
      href: "/plastic", // Updated
      image: "/image11.png",
      id: "plastic",
    },
    {
      name: "Glass Made Products",
      count: "Loading...",
      href: "/glass", // Updated
      image: "/image22.png",
      id: "glass",
    },
    {
      name: "Rubber Made Products",
      count: "Loading...",
      href: "/rubber", // Updated
      image: "/image3.png",
      id: "rubber",
    },
    {
      name: "General Recycled Items",
      count: "Loading...",
      href: "/recycled", // Updated
      image: "/image6.png",
      id: "recycled",
    },
  ]);

  // Fetch product counts
  useEffect(() => {
    const fetchProductCounts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/count`, {
          timeout: 30000,
        });
        console.log('CategoriesSection: Product Counts Response:', response.data);
        const updatedCategories = categories.map((cat) => {
          const countData = response.data.find((item) => item.category === cat.name);
          return {
            ...cat,
            count: countData ? `${countData.count.toLocaleString()} products` : '0 products',
          };
        });
        setCategories(updatedCategories);
      } catch (error) {
        console.error('CategoriesSection: Fetch Error:', error.response?.data || error.message);
        setCategories(categories.map((cat) => ({ ...cat, count: 'Error' })));
      }
    };
    fetchProductCounts();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Explore these categories</h2>
        <Link
          href="/categories"
          className="text-white font-medium text-sm bg-green-600 px-3 py-1 rounded-full hover:bg-green-700 transition"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="block group"
          >
            <div className="overflow-hidden rounded-xl">
              <Image
                src={cat.image}
                alt={cat.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover transition duration-300 group-hover:scale-105 rounded-xl"
              />
            </div>
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center">
                <Leaf className="h-4 w-4 text-green-600 mr-1" />
                <h3 className="text-base font-semibold text-gray-900">{cat.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}