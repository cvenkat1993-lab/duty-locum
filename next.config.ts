import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
    typescript: {
    ignoreBuildErrors: true, // ✅ ignore TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ ignore lint errors
  },
};

export default nextConfig;
