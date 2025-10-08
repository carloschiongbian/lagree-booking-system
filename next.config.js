/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
   webpack: (config) => {
    config.module.exprContextCritical = false; // 👈 disables the warning
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
