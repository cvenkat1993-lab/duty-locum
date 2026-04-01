import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",  // <--- important for static export
};

export default nextConfig;

