/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/suite/:path*',
        destination: 'http://localhost:8080/suite/:path*',
      },
    ];
  },
};

export default nextConfig;
