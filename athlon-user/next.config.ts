import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'unsplash-images',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /^\/org\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'org-pages',
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
