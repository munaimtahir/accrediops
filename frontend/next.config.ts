import type { NextConfig } from "next";

function normalizeBackendUrl(raw: string) {
  const cleaned = raw.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned.slice(0, -4) : cleaned;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async rewrites() {
    const backendUrl = normalizeBackendUrl(
      process.env.BACKEND_API_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://127.0.0.1:8000",
    );

    return [
      {
        source: "/api/:path*/",
        destination: `${backendUrl}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
