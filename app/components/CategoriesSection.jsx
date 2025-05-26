import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function CategoriesSection() {
  const categories = [
    {
      name: "Plastic Made Products",
      count: "1,245 products",
      href: "/category/plastic",
      image: "/image1.png",
      icon: <Leaf className="h-4 w-4 text-green-600 mr-1" />,
    },
    {
      name: "Glass Made Products",
      count: "1,245 products",
      href: "/category/glass",
      image: "/image2.png",
      icon: <Leaf className="h-4 w-4 text-green-600 mr-1" />,
    },
    {
      name: "Rubber Made Products",
      count: "1,245 products",
      href: "/category/rubber",
      image: "/image3.png",
      icon: <Leaf className="h-4 w-4 text-green-600 mr-1" />,
    },
    {
      name: "Others",
      count: "1,245 products",
      href: "/category/others",
      image: "/image4.png",
      icon: <Leaf className="h-4 w-4 text-green-600 mr-1" />,
    },
  ];

  return (
    <section className="px-4 md:px-8 lg:px-16 py-8">
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
        {categories.map((cat, idx) => (
          <Link
            key={idx}
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
              {cat.icon && cat.icon}
              <h3 className="text-base font-semibold text-gray-900 inline">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}