'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending request:', { name, email, password, role });
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      console.log('Response status:', res.status, 'OK:', res.ok);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('verifyingEmail', email);
      localStorage.setItem('tempPassword', password); // Store password temporarily
      router.push('/verify-email');
    } catch (err) {
      console.error('Fetch error:', err.message, err);
      alert(`Signup failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="block w-full p-2 mb-4 border rounded"
          required
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="block w-full p-2 mb-4 border rounded"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="block w-full p-2 mb-4 border rounded"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="block w-full p-2 mb-6 border rounded"
        >
          <option value="">Select your role</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller (e.g. DColler)</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}