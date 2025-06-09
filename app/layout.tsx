import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Toaster } from 'react-hot-toast';


// Import Onest font with appropriate subsets
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eraiiz - Shop Sustainable, Live Responsible",
  description:
    "Eraiiz is the ultimate global platform for eco-friendly shopping. Discover ethically-made products that promote sustainable living. Join the Eraiiz movement to make a positive impact on the planet, one responsible purchase at a time.",
  keywords: [
    "Eraiiz",
    "Sustainable Shopping",
    "Eco-Friendly Products",
    "Ethical Marketplace",
    "Sustainability Platform",
    "Green Products",
    "Eco-Conscious Shopping",
    "Global Sustainability",
    "Sustainable Living",
    "Zero Waste",
    "Fair Trade Products",
    "Green Living",
    "Climate Conscious Shopping",
    "Sustainable Lifestyle",
  ],
  openGraph: {
    title: "Eraiiz - Shop Sustainable, Live Responsible",
    description:
      "Join Eraiiz, the global platform for eco-conscious shopping. Discover sustainable, ethically-made products designed to protect our planet. Shop responsibly and create a greener future.",
    url: "https://www.eraiiz.com",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Eraiiz - Global Sustainable Shopping Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eraiiz - Shop Sustainable, Live Responsible",
    description:
      "Discover eco-friendly, ethically-made products from around the world. Eraiiz is your destination for sustainable shopping.",
    images: ["/images/eraiiz-banner.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={`${onest.variable} antialiased`}>
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
      </body>
    </html>
  );
}
