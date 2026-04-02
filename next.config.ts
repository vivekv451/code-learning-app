import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "bcryptjs"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;