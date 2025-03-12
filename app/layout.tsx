import type { Metadata } from "next";
import { Onest } from "next/font/google"; 
import "./globals.css";
import Navbar from "./components/Navbar";

// Import Onest font with appropriate subsets
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Adjust weights as needed
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eraiiz - Shop Sustainable, Live Responsible",
  description: "Eraiiz is a global online marketplace dedicated to sustainable living. Discover and shop eco-friendly, ethically-made products from around the world. Join the Eraiiz movement and make a positive impact on the planet, one purchase at a time.",
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
    "Eco-Friendly Marketplace",
  ],
  openGraph: {
    title: "Eraiiz - Shop Sustainable, Live Responsible",
    description: "Join Eraiiz, the global platform for eco-conscious shopping. Discover sustainable, ethically-made products designed to protect our planet. Shop responsibly and create a greener future.",
    url: "https://www.eraiiz.com",
    type: "website",
    images: [
      {
        url: "/images/eraiiz-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Eraiiz - Global Sustainable Shopping Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eraiiz - Shop Sustainable, Live Responsible",
    description: "Discover eco-friendly, ethically-made products from around the world. Eraiiz is your destination for sustainable shopping.",
    images: ["/images/eraiiz-banner.jpg"],
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
      <body
        className={`${onest.variable} antialiased`} // Apply Onest font here
      >
        <div className="relative z-10">
          <Navbar />
        </div>
        {children}
      </body>
    </html>
  );
}
