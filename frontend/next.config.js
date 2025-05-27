/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
    SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:3001',
  },
  webpack: (config, { isServer }) => {
    // Optimize for chess.js and other heavy libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Enable SWC minification for better performance
  swcMinify: true,
  // Compress responses
  compress: true,
  // Enable React strict mode
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
};

module.exports = nextConfig; 