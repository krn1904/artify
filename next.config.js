/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Ensure the MongoDB driver is handled on the server in RSC
  serverExternalPackages: ['mongodb'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/commissions',
        destination: '/requests',
        permanent: true,
      },
      {
        source: '/commissions/new',
        destination: '/requests/new',
        permanent: true,
      },
      {
        source: '/commissions/:path*',
        destination: '/requests/:path*',
        permanent: true,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Prevent client bundles from trying to polyfill Node core modules
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
        timers: false,
      }
      // Avoid optional deps pulled by mongodb from being bundled client-side
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        mongodb: false,
        'mongodb-client-encryption': false,
        '@aws-sdk/credential-providers': false,
        aws4: false,
        'timers/promises': false,
      }
    }
    return config
  },
};

module.exports = nextConfig;
