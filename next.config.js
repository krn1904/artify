/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  
  // Moved from experimental in Next.js 16
  serverExternalPackages: ['mongodb'],
  
  typescript: {
    // Don't fail build on TS errors (use with caution)
    ignoreBuildErrors: true,
  },
  
  // Empty turbopack config to silence Next.js 16 warning
  // Turbopack handles server-side packages automatically
  turbopack: {},
};

module.exports = nextConfig;
