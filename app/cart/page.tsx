import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled
const CartClient = dynamic(() => import('./CartClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Cart | Eraiiz',
  description: 'View and manage your shopping cart on Eraiiz.',
};

export default function CartPage() {
  return <CartClient />;
} 