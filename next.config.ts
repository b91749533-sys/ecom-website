import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.sephora.com" },
      { protocol: "https", hostname: "**.ulta.com" },
      { protocol: "https", hostname: "**.dior.com" },
      { protocol: "https", hostname: "**.chanel.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
