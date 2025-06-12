"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { label: "About Eraiiz", href: "/about" },
  { label: "Products", href: "/login" },
  { label: "FAQs", href: "/faqs" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 z-50">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Eraiiz Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7 text-black">
            {navLinks.map((item, index) => (
              <Link key={index} href={item.href}>
                <span className="relative group font-bold transition-colors text-black hover:text-green-600 cursor-pointer">
                  {item.label}
                  <span className="block h-[2px] w-0 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}

            {/* Contact Support */}
            <a
              href="mailto:eraiizinfo@gmail.com"
              className="relative group text-green-600 font-bold transition-colors hover:text-black"
            >
              Contact Support
              <span className="block h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Sign Up (Desktop) */}
          <Link
            href="signup"
            className="hidden md:flex items-center px-6 py-2 rounded-lg text-green-500 font-bold border border-green-500 transition-colors hover:bg-green-500 hover:text-white"
          >
            Sign Up Now
          </Link>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} aria-label="Toggle mobile menu">
              <FiMenu size={30} className="text-black" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-white flex flex-col justify-center items-center z-50 transition-all duration-300">
          {/* Close Button */}
          <button
            onClick={toggleMenu}
            className="absolute top-6 right-6"
            aria-label="Close mobile menu"
          >
            <FiX size={35} className="text-black" />
          </button>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col items-center gap-6 text-xl font-bold text-black">
            {navLinks.map((item, index) => (
              <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
                <span className="relative group cursor-pointer hover:text-green-600 transition-colors">
                  {item.label}
                  <span className="block h-[2px] w-0 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ))}

            {/* Email */}
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
              <Image src="/logo.png" width={80} height={70} alt="Eraiiz Logo" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
