/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
    // Ensure the MongoDB driver is handled on the server in RSC
    serverComponentsExternalPackages: ['mongodb'],
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
