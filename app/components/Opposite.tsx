"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import axios from "axios";
import Link from "next/link";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
}

const Opposite = () => {
  const sectionRef = useRef(null);
  const largeImageRef = useRef(null);
  const smallImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/random`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch products for showcase:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      // Large Image Animation
      if (largeImageRef.current) {
        gsap.fromTo(
          largeImageRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            scrollTrigger: {
              trigger: largeImageRef.current,
              start: "top 80%",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      // Small Images Animation (draggable and hover effects removed)
      smallImageRefs.current.forEach((img, index) => {
        if (img) {
          gsap.fromTo(
            img,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              delay: index * 0.2,
              scrollTrigger: {
                trigger: img,
                start: "top 90%",
                end: "top 50%",
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => context.revert();
  }, [products]);

  const largeImage = products[0]?.images?.[0] || "/largeimage.png";
  const smallImages = [
    products[1]?.images?.[0] || "/side1.png",
    products[2]?.images?.[0] || "/slide2.png",
  ];

  return (
    <div ref={sectionRef} className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 my-10 sm:my-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left side - Large Image */}
        <Link href={products[0] ? `/product/${products[0]._id}` : "#"} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            ref={largeImageRef}
            src={largeImage}
            alt={products[0]?.name || "Featured Product"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-sm font-medium">Discover our sustainable collection</p>
          </div>
        </Link>

        {/* Right side - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 lg:mt-0">
          {/* First Image */}
          <Link href={products[1] ? `/product/${products[1]._id}` : "#"} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800 order-1 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              ref={(el) => {
                smallImageRefs.current[0] = el;
              }}
              src={smallImages[0]}
              alt={products[1]?.name || "Product View"}
              className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
            />
          </Link>

          {/* First Text Card (Black) */}
          <div className="group bg-black rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative order-2 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-white text-xl sm:text-2xl font-medium mb-3 sm:mb-4 group-hover:text-[#00B300] transition-colors">Plastics</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Discover a range of innovative and sustainable products crafted from recycled plastics.
              </p>
            </div>
            <button className="relative z-10 bg-white text-black rounded-full py-2 sm:py-2.5 px-5 sm:px-6 text-sm font-medium transition-all duration-300 hover:bg-[#00B300] hover:text-white hover:shadow-lg hover:shadow-[#00B300]/20 transform hover:-translate-y-0.5 active:translate-y-0 w-fit mt-4">
              Start shopping
            </button>
          </div>

          {/* Second Image */}
          <Link href={products[2] ? `/product/${products[2]._id}` : "#"} className="group relative aspect-[4/3] rounded-2xl overflow-hidden order-3 lg:order-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 opacity-75 group-hover:opacity-90 transition-opacity duration-300" />
            <img
              ref={(el) => {
                smallImageRefs.current[1] = el;
              }}
              src={smallImages[1]}
              alt={products[2]?.name || "Product Showcase"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>

          {/* Second Text Card (White) */}
          <div className="group bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-gray-100 hover:border-[#00B300] transition-all duration-300 hover:shadow-xl order-4 lg:order-3">
            <div>
              <h3 className="text-black text-xl sm:text-2xl font-medium mb-3 sm:mb-4 group-hover:text-[#00B300] transition-colors">Plastics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From durable home essentials to stylish accessories, each piece is designed to showcase the power of sustainability without compromising on quality.
              </p>
            </div>
            <button className="bg-[#008C00] text-white rounded-full py-2 sm:py-2.5 px-5 sm:px-6 text-sm font-medium transition-all duration-300 hover:bg-[#00B300] hover:shadow-lg hover:shadow-[#00B300]/20 transform hover:-translate-y-0.5 active:translate-y-0 w-fit mt-4">
              Start shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Opposite;
