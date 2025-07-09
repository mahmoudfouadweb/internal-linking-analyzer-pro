/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_NESTJS_BACKEND_URL: process.env.NEXT_PUBLIC_NESTJS_BACKEND_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_NESTJS_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
