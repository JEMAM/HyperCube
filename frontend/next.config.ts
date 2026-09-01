import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  allowedDevOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "localhost:3003", "54.232.189.113", "54.232.189.113:3000", "54.232.189.113:3001"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
