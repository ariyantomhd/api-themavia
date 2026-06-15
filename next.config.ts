import type { NextConfig } from 'next';
import WebpackObfuscator from 'webpack-obfuscator';
import type { Configuration, WebpackPluginInstance } from 'webpack';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'iconbuddy.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'qtllxpeootlcbkiugkmv.supabase.co' },
    ],
  },

  // Menyembunyikan struktur folder API asli
  async rewrites() {
    return [
      {
        source: '/v1/auth/sign-out', // URL yang dilihat user
        destination: '/api/v1/auth/logout', // Path file asli
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    // Jalankan obfuscator hanya di client dan di mode produksi
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new WebpackObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
          compact: true,
          controlFlowFlattening: true,
        }) as WebpackPluginInstance
      );
    }
    return config;
  },
};

export default nextConfig;