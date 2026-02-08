import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@clerk/nextjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
