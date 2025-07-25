// next.config.js
const withPWA = require('next-pwa')({
  // The 'dest' option defines where the generated files would go,
  // but since we're disabling generation, it effectively doesn't apply to sw.js.
  // However, it might still be used for other PWA assets like manifest.json,
  // so keeping it is generally fine.
  dest: 'public',

  // This is the CRUCIAL line. Setting disable to true tells next-pwa
  // to completely skip generating, registering, or managing the service worker.
  disable: true,

  // All these options are related to next-pwa's *internal* service worker generation.
  // Since we've set disable: true, they become redundant for sw.js and can be removed
  // to avoid confusion or potential (though unlikely) side effects.
  // register: true, // No longer needed as you'll register your custom sw.js manually
  // skipWaiting: true, // No longer needed
  // buildExcludes: [/sw\.js\.map$/], // No longer needed as next-pwa won't generate sw.js or its map
  // runtimeCaching: [], // No longer needed as next-pwa won't generate sw.js based on these rules
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            // It's good practice to set Cache-Control for your custom sw.js
            // to ensure browsers always get the latest version on reload.
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);