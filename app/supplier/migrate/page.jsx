'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MigratePage() {
  const [step, setStep] = useState(1);
  const [treeHeight, setTreeHeight] = useState(0);
  const canvasRef = useRef(null);

  // Simulate migration steps completion (replace with real API calls later)
  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleComplete = () => {
    setStep(4); // Final step
    alert('Migration successful! You are now a seller. Redirecting to your dashboard...');
    // Replace with actual redirect: window.location.href = '/dashboard/seller';
  };

  // Animate the progress tree
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 200;
    const height = canvas.height = 300;

    const drawTree = () => {
      ctx.clearRect(0, 0, width, height);
      const trunkHeight = Math.min(treeHeight, 150);
      const leafHeight = Math.max(0, treeHeight - 150);

      // Trunk
      ctx.fillStyle = '#4A2C2A';
      ctx.fillRect(90, height - trunkHeight, 20, trunkHeight);

      // Leaves
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.arc(100, height - trunkHeight - leafHeight / 2, leafHeight / 2, 0, Math.PI * 2);
      ctx.fill();

      if (treeHeight < 200) {
        setTreeHeight(treeHeight + 1);
        requestAnimationFrame(drawTree);
      }
    };

    if (step > 1) drawTree();
  }, [step, treeHeight]);

  useEffect(() => {
    setTreeHeight(0); // Reset tree when step changes
    if (step > 1) {
      const timer = setInterval(() => setTreeHeight((prev) => Math.min(prev + 10, 200)), 50);
      return () => clearInterval(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 text-gray-800">
      {/* Hero Section */}
      <header className="relative bg-[url('https://images.unsplash.com/photo-1501854140801-50d016989604?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold drop-shadow-lg">Become a Seller</h1>
          <p className="mt-2 text-lg">Embark on your journey to join the Eraiiz ecosystem</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Migration Steps */}
        <div className="md:w-2/3 space-y-6">
          <h2 className="text-2xl font-semibold">Your Migration Path</h2>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className={`p-6 rounded-lg bg-white shadow-md transition-all ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <h3 className="text-xl font-medium">Step 1: Verify Your Identity</h3>
              <p className="mt-2 text-gray-600">Provide your business details and ID for verification.</p>
              {step === 1 && (
                <button
                  onClick={handleNextStep}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Start Verification
                </button>
              )}
            </div>

            {/* Step 2 */}
            <div className={`p-6 rounded-lg bg-white shadow-md transition-all ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <h3 className="text-xl font-medium">Step 2: Set Up Your Store</h3>
              <p className="mt-2 text-gray-600">Customize your seller profile and upload products.</p>
              {step === 2 && (
                <button
                  onClick={handleNextStep}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Configure Store
                </button>
              )}
            </div>

            {/* Step 3 */}
            <div className={`p-6 rounded-lg bg-white shadow-md transition-all ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <h3 className="text-xl font-medium">Step 3: Payment Setup</h3>
              <p className="mt-2 text-gray-600">Link your payment method for transactions.</p>
              {step === 3 && (
                <button
                  onClick={handleNextStep}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Payment
                </button>
              )}
            </div>

            {/* Step 4 */}
            <div className={`p-6 rounded-lg bg-white shadow-md transition-all ${step >= 4 ? 'opacity-100' : 'opacity-50'}`}>
              <h3 className="text-xl font-medium">Step 4: Launch Your Journey</h3>
              <p className="mt-2 text-gray-600">Confirm and start selling on Eraiiz!</p>
              {step < 4 && <p className="mt-2 text-gray-500">Complete previous steps to unlock.</p>}
              {step === 4 && (
                <button
                  onClick={handleComplete}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Confirm Migration
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Tree */}
        <div className="md:w-1/3 flex justify-center">
          <div className="relative">
            <canvas ref={canvasRef} className="border rounded-lg shadow-md bg-gray-50" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 text-center">
              <p className="text-sm font-medium text-green-700">Growth Stage: {step}/4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <footer className="text-center py-6 text-gray-500">
        <p>Ready to grow with Eraiiz? Your sustainable selling journey begins here.</p>
        <Link href="/dashboard/seller" className="mt-2 inline-block text-green-600 hover:underline">
          Explore Seller Dashboard
        </Link>
      </footer>
    </div>
  );
}