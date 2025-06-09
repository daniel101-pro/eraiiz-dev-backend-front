'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, ChevronDown, Search, Filter, Menu } from 'lucide-react';
import CategoriesSection from '../../components/CategoriesSection';
import DualNavbarSell from '../../components/DualNavbarSell';
import ProductCard from '../../components/ProductCard';

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsForYou, setProductsForYou] = useState([]);
  const [imageError, setImageError] = useState(null); // For debugging image issues
  const router = useRouter();

  const carouselItems = [
    {
      image: '/plastic-products.png',
      alt: 'Plastic Made Products',
      title: 'Plastic Made Chairs',
      subtitle: 'Discover a range of innovative and sustainable products crafted from recycled plastics.',
      link: '/category/plastic',
    },
    {
      image: '/glass-products.png',
      alt: 'Glass Made Products',
      title: 'Glass Made Chairs',
      subtitle: 'Explore the beauty of sustainability with our Glass Made Products, combining elegance with eco-consciousness.',
      link: '/category/glass',
    },
    {
      image: '/recycled-products.png',
      alt: 'Fruits Waste Products',
      title: 'Fruits Waste Chairs',
      subtitle: 'Discover innovation in every piece with our Recycled Products — turning waste into purposeful beauty.',
      link: '/category/fruits-waste',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role === 'buyer') {
          setUser(parsedUser);
          setLoading(false);
        } else {
          router.push(`/dashboard/${parsedUser?.role || 'buyer'}`);
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchProductsForYou = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/random?limit=8`);
        setProductsForYou(res.data);
      } catch (err) {
        console.error('Error fetching products for you:', err);
      }
    };
    fetchProductsForYou();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-green-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DualNavbarSell handleLogout={handleLogout} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out mb-4"
                style={{ transform: `translateX(-${currentIndex * (100 / (window.innerWidth >= 768 ? 2 : 1))}%)` }}
              >
                {carouselItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full md:w-1/2 flex flex-col md:flex-row md:items-center p-2 md:mr-4"
                  >
                    <div className="relative w-full h-80 rounded-l-lg overflow-hidden md:block" style={{ position: 'relative' }}>
                      <Image
                        src={item.image}
                        alt={item.alt}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-l-lg"
                        draggable={false}
                        onError={() => setImageError(`Failed to load image: ${item.image}`)}
                      />
                      <Link href={item.link} className="md:hidden block w-full h-full">
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent text-white rounded-b-lg">
                          <h2 className="text-xl font-bold">{item.title}</h2>
                          <p className="text-sm">{item.subtitle}</p>
                        </div>
                      </Link>
                    </div>
                    <div className="hidden md:flex flex-col justify-center md:mt-0 md:flex-[0_0_40%] md:pl-4 h-80 border border-gray-200 md:border-l md:border-r md:rounded-r-lg md:flex-row md:items-center">
                      <div className="md:flex-1">
                        <h2 className="text-2xl font-medium text-black mb-4">{item.title}</h2>
                        <p className="text-sm -mt-1 text-gray-500 mb-4 md:mb-0">{item.subtitle}</p>
                        <Link href={item.link}>
                          <button
                            className="bg-green-600 mt-32 text-white px-6 py-2 rounded-md hover:bg-green-700 transition w-fit"
                          >
                            Learn More
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-green-600' : 'bg-gray-200'}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
              {imageError && <p className="text-red-600 text-center mt-4">{imageError}</p>}
            </div>
          </div>

          <div className="mb-12">
            <CategoriesSection />
          </div>

          <div className="px-4 md:px-8 lg:px-16 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Products for You</h2>
              <Link href="/for-you">
                <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
                  See All
                </button>
              </Link>
            </div>
            {productsForYou.length === 0 ? (
              <p className="text-gray-600">No products available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {productsForYou.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center border-t border-gray-200 pt-4 mb-4 text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} ERaiiz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}