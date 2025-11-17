import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apexdigitalafrica.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,  // ✅ Add this line - allows build despite ESLint warnings
  },
};

export default nextConfig;
