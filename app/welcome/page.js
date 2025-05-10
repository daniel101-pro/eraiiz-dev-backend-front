'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState('EcoHero');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Simulate role from localStorage
    const role = localStorage.getItem('role') || 'buyer'; // Default to 'buyer' if not set
    if (role === 'seller') setName('EcoVendor');
    else if (role === 'buyer') setName('PlanetGuardian');

    // Update window size for confetti
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-300 to-emerald-600 text-center px-4 relative overflow-hidden">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={200}
        recycle={false} // Keeps confetti running until unmounted
        gravity={0.2}
        colors={['#00cc99', '#66ccff', '#ffcc00', '#ff6666', '#cc99ff']}
      />

      <motion.h1
        className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        🌍 Welcome to Eraiiz, {name}!
      </motion.h1>

      <motion.p
        className="text-white text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.2 }}
      >
        You've joined the revolution of responsible commerce. Together, we’re saving the planet, one sustainable choice at a time. 🌱
      </motion.p>

      <motion.button
        className="bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-100 transition-all duration-300"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(0, 204, 153, 0.7)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleContinue}
      >
        🌿 Embark on Your Eco-Mission
      </motion.button>

      {/* Subtle decorative element */}
      <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-emerald-700 to-transparent opacity-50"></div>
    </div>
  );
}