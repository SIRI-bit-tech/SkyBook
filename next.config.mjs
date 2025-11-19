/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { hostname: '**' }
    ],
    unoptimized: true,
  }
};

export default nextConfig;
