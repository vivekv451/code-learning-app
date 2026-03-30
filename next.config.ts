import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pg", "bcryptjs"],
  },
};

export default nextConfig;