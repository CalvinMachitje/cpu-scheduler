import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  allowedDevOrigins: ["196.253.26.120", "localhost", "127.0.0.1"],

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;