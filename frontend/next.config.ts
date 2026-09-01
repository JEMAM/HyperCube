import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3001",
    "localhost:3002",
    "localhost:3003",
    "54.232.189.113",
    "54.232.189.113:3000",
    "54.232.189.113:3001"
  ],
  async rewrites() {
    if (backendUrl && backendUrl.startsWith("http")) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl}/api/:path*`,
        },
      ];
    }
    // In local development, proxy to local FastAPI backend on port 8000
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
      ];
    }
    // On Vercel / Cloud production without external backend, serve internal Next.js Edge routes
    return [];
  },
};

export default nextConfig;
