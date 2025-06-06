import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dagvrhy9e/image/upload/**', // Matches your Cloudinary account
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Consider enabling for production builds to catch errors
  },
  rewrites: async () => {
    return [
      {
        source: '/categories',
        destination: '/category',
      },
    ];
  },
};

export default nextConfig;