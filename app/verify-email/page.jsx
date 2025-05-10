'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion'; // For animations
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('verifyingEmail');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const otpCode = otp.join('');
    try {
      console.log('Sending verify request:', { email, otp: otpCode });
      const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/verify-email', {
        email,
        code: otpCode,
      });
      setMessage(res.data.message);
      if (res.data.message === 'Email verified successfully') {
        console.log('Verification successful, logging in user');

        const userRes = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/login', {
          email,
          password: localStorage.getItem('tempPassword'),
        });

        const { accessToken, refreshToken, user } = userRes.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('verifyingEmail');
        localStorage.removeItem('tempPassword');

        console.log('User logged in, redirecting to welcome page');
        router.push('/welcome');
      }
    } catch (err) {
      console.error('Verify error:', err.response?.data, err.message);
      setMessage(err.response?.data?.message || 'Error verifying email');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      console.log('Sending resend request:', { email });
      const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/auth/resend-otp', { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error('Resend error:', err.response?.data, err.message);
      setMessage(err.response?.data?.message || 'Error resending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full transform hover:shadow-3xl transition-all duration-300"
      >
        <h2 className="text-3xl font-extrabold text-center text-emerald-700 mb-6 tracking-wide">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center mb-8 text-lg leading-relaxed">
          Please enter the 6-digit code sent to{' '}
          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            {email}
          </span>
        </p>

        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-14 h-14 text-center text-2xl font-medium border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
              whileFocus={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleVerify}
          disabled={isLoading || otp.some(digit => !digit)}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            isLoading || otp.some(digit => !digit)
              ? 'bg-emerald-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? <LoadingSpinner size={24} color="#ffffff" /> : 'Verify OTP'}
        </motion.button>

        <motion.button
          onClick={handleResend}
          disabled={isLoading}
          className={`w-full py-3 mt-4 rounded-lg font-semibold transition-all duration-300 ${
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Resending...' : 'Resend OTP'}
        </motion.button>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-6 text-center text-base ${
              message.includes('successfully') ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}