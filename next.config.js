/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
    // Ensure the MongoDB driver is handled on the server in RSC
    serverComponentsExternalPackages: ['mongodb'],
  },
  typescript: {
    // Don't fail build on TS errors (use with caution)
    ignoreBuildErrors: true,
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
      }
      // Avoid optional deps pulled by mongodb from being bundled client-side
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'mongodb-client-encryption': false,
        '@aws-sdk/credential-providers': false,
        aws4: false,
      }
    }
    return config
  },
};

module.exports = nextConfig;
