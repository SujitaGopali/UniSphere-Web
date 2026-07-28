import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks /_next/* (incl. HMR + client runtime) from hosts that
  // don't match the server origin. Allow 127.0.0.1 so both localhost and
  // 127.0.0.1 work in local demos.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8089",
      },
    ],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8089/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
