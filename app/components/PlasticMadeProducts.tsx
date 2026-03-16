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

const PlasticMadeProducts = () => {
  const sectionRef = useRef(null);
  const largeImageRef = useRef(null);
  const smallImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/random`);
        if (Array.isArray(res.data) && res.data.length > 3) {
          setProducts(res.data.slice(3, 6));
        } else if (Array.isArray(res.data)) {
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
      if (largeImageRef.current) {
        gsap.fromTo(
          largeImageRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            scrollTrigger: {
              trigger: largeImageRef.current,
              start: "top 80%",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      smallImageRefs.current.forEach((img, index) => {
        if (img) {
          gsap.fromTo(
            img,
            { x: index % 2 === 0 ? -100 : 100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.5,
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
    <div ref={sectionRef} className="w-full flex flex-col items-center mt-10 mb-20">
      <h1 className="text-3xl font-medium text-center mb-8 bg-[#FCFDFE] text-black w-full border-[#EAEBEC] border-2 p-4 rounded-lg">
        Plastic Made Products (PMP)
      </h1>
      <div className="w-full flex justify-center">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 w-full px-5 md:w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {smallImages.map((src, index) => (
              <Link href={products[index + 1] ? `/product/${products[index + 1]._id}` : "#"} key={index} className="h-[290px] flex justify-center">
                <img
                  ref={(el) => { smallImageRefs.current[index] = el; }}
                  src={src}
                  alt={products[index + 1]?.name || `Product ${index + 2}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </Link>
            ))}
            <div className="bg-black text-white p-6 rounded-2xl flex flex-col justify-between h-[290px]">
              <div>
                <h2 className="font-bold text-xl mb-2">Plastics</h2>
                <p className="text-sm">
                  Discover a range of innovative and sustainable products crafted from recycled plastics.
                </p>
              </div>
              <Link href="/login">
                <button className="mt-4 bg-white text-black px-4 py-2 rounded-lg font-semibold">
                  Start shopping
                </button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-[290px]">
              <div>
                <h2 className="font-bold text-black text-xl mb-2">Plastics</h2>
                <p className="text-gray-500 text-sm">
                  From durable home essentials to stylish accessories, each piece showcases sustainability.
                </p>
              </div>
              <Link href="/login">
                <button className="mt-4 bg-[#008C00] text-white px-4 py-2 rounded-lg font-semibold">
                  Start shopping
                </button>
              </Link>
            </div>
          </div>
          <Link href={products[0] ? `/product/${products[0]._id}` : "#"} className="w-full h-[600px] flex justify-center">
            <img
              ref={largeImageRef}
              src={largeImage}
              alt={products[0]?.name || "Product"}
              className="w-full h-full object-cover rounded-2xl"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlasticMadeProducts;
