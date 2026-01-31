/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { turbo: false },
  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },

  // Add this to improve caching of static chunks
  async headers() {
    return [
      {
        source: "/_next/static/:path*", // matches all static chunks
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year, immutable
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
