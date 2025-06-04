'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MigratePage() {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const termsRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll to track progress and bottom detection
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setIsScrolledToBottom(true);
    } else {
      setIsScrolledToBottom(false);
    }
  };

  // Handle form submission (migrate to seller)
  const handleAcceptAndContinue = () => {
    if (isScrolledToBottom) {
      alert('Migration successful! You are now a seller. Redirecting to your dashboard...');
      // Replace with actual redirect: window.location.href = '/dashboard/seller';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-gray-100 text-gray-800 relative overflow-hidden">
      {/* Animated Leaf Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 bg-green-500 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <header className="relative z-10 bg-[url('https://images.unsplash.com/photo-1501854140801-50d016989604?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold drop-shadow-lg">Become a Seller</h1>
          <p className="mt-2 text-lg">Accept our Terms to join the Eraiiz ecosystem</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Terms and Conditions</h2>
          <div
            ref={termsRef}
            onScroll={handleScroll}
            className="h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white p-6 shadow-md"
          >
            <h3 className="text-xl font-medium mb-4">Eraiiz Seller Terms and Conditions</h3>
            <p className="mb-4">
              Welcome to Eraiiz, a platform dedicated to sustainable commerce. These Terms and Conditions ("Terms") govern your use of our services as a seller. By proceeding, you agree to be bound by these Terms. Please read them carefully.
            </p>
            <p className="mb-4">
              <strong>1. Acceptance of Terms</strong><br />
              By registering as a seller, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines or rules applicable to specific services. If you do not agree, you may not use or access our platform.
            </p>
            <p className="mb-4">
              <strong>2. Eligibility</strong><br />
              To become a seller, you must be at least 18 years old and have the legal capacity to enter into a binding contract. You must provide accurate and complete information during the registration process.
            </p>
            <p className="mb-4">
              <strong>3. Seller Account</strong><br />
              You are responsible for maintaining the confidentiality of your account credentials. Any activities conducted under your account are your responsibility. Eraiiz reserves the right to suspend or terminate accounts that violate these Terms.
            </p>
            <p className="mb-4">
              <strong>4. Product Listings</strong><br />
              All products must comply with Eraiiz’s sustainability standards. You are prohibited from listing counterfeit, illegal, or unsafe items. Eraiiz may remove listings that do not meet our guidelines without prior notice.
            </p>
            <p className="mb-4">
              <strong>5. Fees and Payments</strong><br />
              Sellers are subject to transaction fees as outlined in our Fee Schedule, which may be updated from time to time. Payments will be processed in the currency selected during setup, subject to exchange rate fluctuations.
            </p>
            <p className="mb-4">
              <strong>6. Shipping and Delivery</strong><br />
              You are responsible for ensuring timely and eco-friendly shipping. Eraiiz encourages the use of biodegradable packaging. Failure to meet delivery standards may result in penalties or account suspension.
            </p>
            <p className="mb-4">
              <strong>7. Intellectual Property</strong><br />
              You retain ownership of your product listings’ content, but you grant Eraiiz a non-exclusive, royalty-free license to use, display, and distribute this content on the platform.
            </p>
            <p className="mb-4">
              <strong>8. Customer Service</strong><br />
              You must respond to customer inquiries within 48 hours. Eraiiz provides a dispute resolution process, but ultimate responsibility for customer satisfaction lies with you.
            </p>
            <p className="mb-4">
              <strong>9. Termination</strong><br />
              Eraiiz may terminate or suspend your seller account at its discretion for violations of these Terms, including but not limited to fraud, misrepresentation, or non-compliance with sustainability policies.
            </p>
            <p className="mb-4">
              <strong>10. Liability</strong><br />
              Eraiiz is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. You agree to indemnify Eraiiz against claims resulting from your actions as a seller.
            </p>
            <p className="mb-4">
              <strong>11. Changes to Terms</strong><br />
              We may update these Terms periodically. Continued use of the platform after changes constitutes acceptance of the new Terms. We will notify you of significant updates via email or on the platform.
            </p>
            <p className="mb-4">
              <strong>12. Governing Law</strong><br />
              These Terms are governed by the laws of Nigeria. Any disputes will be resolved in the courts of Lagos, Nigeria.
            </p>
            <p className="mb-4">
              <strong>13. Privacy</strong><br />
              Your personal and business data will be handled in accordance with our Privacy Policy. We collect data to improve services and ensure compliance with these Terms.
            </p>
            <p className="mb-4">
              <strong>14. Sustainability Commitment</strong><br />
              As a seller on Eraiiz, you commit to upholding our mission of sustainability. This includes using eco-friendly materials and adhering to waste reduction practices.
            </p>
            <p className="mb-4">
              <strong>15. Refund Policy</strong><br />
              You must offer refunds or exchanges as per Eraiiz’s refund policy. Details are available in the Seller Handbook, accessible via your dashboard.
            </p>
            <p className="mb-4">
              <strong>16. Prohibited Activities</strong><br />
              You may not engage in spamming, phishing, or any activity that harms the platform’s reputation. Violation may lead to immediate account termination.
            </p>
            <p className="mb-4">
              <strong>17. Intellectual Property Infringement</strong><br />
              Report any infringement to support@eraiiz.com. Eraiiz will investigate and take appropriate action under applicable laws.
            </p>
            <p className="mb-4">
              <strong>18. Force Majeure</strong><br />
              Eraiiz is not liable for delays or failures due to events beyond our control, such as natural disasters or government actions.
            </p>
            <p className="mb-4">
              <strong>19. Contact Us</strong><br />
              For questions, contact us at support@eraiiz.com or +234-800-ERAIIZ. We are committed to assisting you.
            </p>
            <p className="mb-4">
              <strong>20. Entire Agreement</strong><br />
              These Terms constitute the entire agreement between you and Eraiiz regarding your use as a seller. Any prior agreements are superseded.
            </p>
            {/* Add more paragraphs to make it lengthy */}
            {[...Array(10)].map((_, i) => (
              <p key={i} className="mb-4">
                <strong>Additional Clause {i + 21}:</strong><br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <button
            onClick={handleAcceptAndContinue}
            disabled={!isScrolledToBottom}
            className={`mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
              !isScrolledToBottom ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Accept Terms and Continue"
          >
            Accept and Continue
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <footer className="text-center py-6 text-gray-500 relative z-10">
        <p>Ready to grow with Eraiiz? Your sustainable selling journey begins with acceptance.</p>
        <Link href="/dashboard/seller" className="mt-2 inline-block text-green-600 hover:underline">
          Explore Seller Dashboard
        </Link>
      </footer>
    </div>
  );
}