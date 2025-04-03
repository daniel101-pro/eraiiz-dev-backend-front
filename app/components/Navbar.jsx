"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Black icons for menu & close

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 z-50">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <Image src="/logo.png" width={70} height={60} alt="logo" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7 text-black">
            {[
              "About Eraiiz",
              "How to watch?",
              "Products",
              "FAQs",
            ].map((item, index) => (
              <Link key={index} href="/">
                <span className="relative group font-bold transition-colors text-black hover:text-green-600">
                  {item}
                  <span className="block h-[2px] w-0 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}
            
            {/* Contact Support Link */}
            <a
              href="mailto:eraiizinfo@gmail.com"
              className="relative group text-green-600 font-bold transition-colors hover:text-black"
            >
              Contact Support
              <span className="block h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Sign Up Button (Desktop) */}
          <Link
            href="/joinWaitlistPage"
            className="hidden md:flex items-center px-6 py-2 rounded-lg text-green-500 font-bold border border-green-500 transition-colors hover:bg-green-500 hover:text-white"
          >
            Sign Up Now
          </Link>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu}>
              <FiMenu size={30} className="text-black" />
            </button>
          </div>
        </nav>
      </div>

      {/* Full-Screen Mobile Menu */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-white flex flex-col justify-center items-center z-50">
          {/* Close Button */}
          <button onClick={toggleMenu} className="absolute top-6 right-6">
            <FiX size={35} className="text-black" />
          </button>

          {/* Navigation Links */}
          <div className="flex flex-col items-center gap-6 text-xl font-bold text-black">
            {[
              "About Eraiiz",
              "How to watch?",
              "Products",
              "FAQs",
            ].map((item, index) => (
              <Link key={index} href="/" className="relative group">
                <span className="transition-colors text-black hover:text-green-600">
                  {item}
                  <span className="block h-[2px] w-0 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}

            {/* Contact Support Link */}
            <a
              href="mailto:eraiizinfo@gmail.com"
              className="relative group text-green-600 transition-colors hover:text-black"
            >
              eraiizinfo@gmail.com
              <span className="block h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Logo at Bottom */}
          <div className="absolute bottom-10">
            <Link href="/">
              <Image src="/logo.png" width={80} height={70} alt="logo" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;