"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GridComponent from "./components/GridComponent";
import PlasticMadeProducts from "./components/PlasticMadeProducts";
import Opposite from "./components/Opposite";
import Opposite2 from "./components/Opposite2";
import Footer from "./components/Footer";
import CallToAction from "./components/CallToAction";
import FaqSection from "./faqs/page";
import BlogCarousel from "./components/BlogCarousel";
import Navbar from "./components/Navbar";

const Page = () => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [backgroundImage, setBackgroundImage] = useState("/Hero.png");

  useEffect(() => {
    // Check screen size to determine which background image to use
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setBackgroundImage("/Hero2.png"); // For mobile devices
      } else {
        setBackgroundImage("/Hero.png"); // For larger screens
      }
    };

    // Initial check
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mainText = "Erase Waste By Shopping Quality Recycled";
    const synonyms = [
      "Products",
      "Items",
      "Materials",
      "Goods",
      "Supplies",
      "Resources",
      "Commodities",
      "Merchandise",
      "Essentials",
      "Assets",
    ];
    let currentText = "";
    let index = 0;
    let synonymIndex = 0;

    const typeWriterAnimation = () => {
      if (index < mainText.length) {
        currentText += mainText[index];
        if (textRef.current) textRef.current.innerText = currentText;
        index++;
        setTimeout(typeWriterAnimation, 30);
      } else {
        changeSynonym();
      }
    };

    const changeSynonym = () => {
      if (textRef.current) {
        textRef.current.innerHTML = `${mainText} <span class="text-[#008C00] font-bold">${synonyms[synonymIndex]}</span>.`;
      }
      synonymIndex = (synonymIndex + 1) % synonyms.length;
      setTimeout(changeSynonym, 1000);
    };

    typeWriterAnimation();
  }, []);

  return (
    <>
    <div className="relative z-10">
          <Navbar />
        </div>
      <div
        className="h-screen bg-no-repeat bg-top bg-contain"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="flex justify-center">
          <Image
            src="/oneone.png"
            width={300}
            height={2}
            alt="oneone"
            className="mt-32 sm:mt-32"
            draggable={false}
          />
        </div>
        <div className="h-full w-full flex flex-col justify-center text-center -mt-36 sm:-mt-[250px] px-4 sm:px-6">
          <h1
            ref={textRef}
            className="text-black text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mt-10 sm:mt-4 md:mt-6 leading-snug md:leading-relaxed text-center"
          ></h1>

          <p className="text-gray-500 text-center font-light mt-2 sm:mt-4 mb-10">
            Shop sustainably with Eraiiz and discover how waste can be
            transformed to wealth <br className="hidden sm:block" />
            while keeping the planet safe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 sm:mt-6 sm:space-x-4 px-6">
            <Link href="/signup">
              <button className="bg-[#008C00] text-white py-3 px-8 rounded-lg w-full sm:w-auto transition-transform duration-300 hover:scale-105">
                Create your account
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-[#FFFFFF] text-black py-3 px-8 rounded-lg w-full sm:w-auto border border-[#D1D1D1] transition-transform duration-300 hover:scale-105">
                Start shopping
              </button>
            </Link>
          </div>
        </div>

        <GridComponent />
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-[45px] font-medium text-gray-900 leading-snug mt-10">
              Connecting Consumers with Sustainable Brands to Reduce{" "}
              <span className="text-[#008C00]">Carbon</span> Footprint
            </h2>
          </div>

          <div className="mt-16 md:mt-80">
            <p className="text-gray-700 mb-6">
              With a small team of passionate individuals, Eraiiz is focused on
              redefining climate action to include earthwise shopping models.
              Our mission is to bridge the gap between sustainable brands and
              global consumers thereby reducing the level of carbon footprint in
              the whole supply chain.
            </p>
            <button className="px-6 py-2 bg-[#008C00] text-white rounded-md hover:bg-black hover:text-white transition-transform duration-300 hover:scale-105">
              Start Shopping
            </button>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-20 mb-20">
          <h1 className="text-3xl font-medium text-center mb-6 text-black">
            Why Eraiiz?
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[950px] p-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px] transition-transform duration-300 hover:scale-105">
              <h2 className="font-light text-xl mb-10 text-black">
                Access to a network of top-picked sustainable choices
              </h2>
              <p className="text-gray-500">
                We pre-vet all products available on Eraiiz to ensure that they
                are sustainably sourced and made.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px] transition-transform duration-300 hover:scale-105">
              <h2 className="font-light text-black text-xl mb-10">
                Easy navigation process
              </h2>
              <p className="text-gray-500">
                Our platform is organized with you in mind, hence, you don&apos;t
                have to go through any hassle, from product sorting to checking
                out, we&apos;ve got you covered.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px] transition-transform duration-300 hover:scale-105">
              <h2 className="font-light text-black text-xl mb-10">
                Data-driven approach
              </h2>
              <p className="text-gray-500">
                We leverage data that are meticulously researched and work with
                experts to connect you with the best sustainable brand you need.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px] flex flex-col justify-between transition-transform duration-300 hover:scale-105">
              <p className="text-gray-500 mt-10">
                Sign Up &amp; Take your first step with Eraiiz to erase waste
              </p>
              <button className="bg-[#008C00] text-white font-semibold py-2 px-4 rounded-lg mt-4">
                Create your account
              </button>
            </div>
          </div>
          <Opposite />
          <PlasticMadeProducts />
          <Opposite2 />
          <BlogCarousel />
          <FaqSection />
          <CallToAction />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Page;
