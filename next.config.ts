/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
      {
        protocol: 'https',
        hostname: 'iconbuddy.com',
      },
      /* 🌟 REVISI: Daftarkan Unsplash agar gambar tiruan/mockup produk di ProductCard aman di-render */
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;