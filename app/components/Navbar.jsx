"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Black icons for menu & close

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false); // Hide when scrolling down
      } else {
        setShowNavbar(true); // Show when scrolling up
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Navbar */}
      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 z-50 transition-transform ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <Image src="/logo.png" width={70} height={60} alt="logo" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7 text-black">
            {["About Eraiiz", "How to watch?", "Products", "FAQs", "Contact Support"].map((item, index) => (
              <Link key={index} href="/">
                <span className="hover:text-gray-300 font-bold">{item}</span>
              </Link>
            ))}
          </div>

          {/* Sign Up Button (Desktop) */}
          <div className="hidden md:flex items-center px-6 py-2 rounded-lg text-green-500 font-bold border border-green-500">
            Sign Up Now
          </div>

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
            {["About Eraiiz", "How to watch?", "Products", "FAQs", "Contact Support"].map((item, index) => (
              <Link key={index} href="/" className="hover:text-gray-400">
                {item}
              </Link>
            ))}
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
