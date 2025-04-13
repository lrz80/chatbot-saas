/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
