/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
  },
  typescript: {
    // Don't fail build on TS errors (use with caution)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;