/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: "export",
  experimental: { turbo: false }, // <- explicitly disable turbopack
  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
};

module.exports = nextConfig;
