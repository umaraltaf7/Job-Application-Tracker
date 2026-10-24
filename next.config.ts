
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  // Allow access to Next.js development resources
  // when opening the app through this LAN address.
  allowedDevOrigins: ["192.168.0.105"],
};

export default nextConfig;
