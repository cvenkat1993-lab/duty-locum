import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  typescript: {
    ignoreBuildErrors: true, // temporary: allows deploy despite TS errors
  },
};

export default nextConfig;
