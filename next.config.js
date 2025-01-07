/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true, // This will allow the build to continue even with ESLint warnings
  },
  typescript: {
    ignoreBuildErrors: true, // This will allow the build to continue even with TypeScript errors
  }
};

module.exports = nextConfig;