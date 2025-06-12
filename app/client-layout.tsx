'use client';

import "./globals.css";
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Get the Google Client ID from environment variables
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '429710625418-18g91vccienk7nhsvchdeehctl9dsl.apps.googleusercontent.com';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-onest antialiased">
        <GoogleOAuthProvider clientId={googleClientId}>
          <CartProvider>
            <CurrencyProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 2000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                  },
                }}
              />
            </CurrencyProvider>
          </CartProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
