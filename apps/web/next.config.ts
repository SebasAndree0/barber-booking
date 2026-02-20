// C:\osobarber\barber-booking\apps\web\next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" }, // miniaturas YouTube
      { protocol: "https", hostname: "img.youtube.com" }, // por si usas este dominio también
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8001/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
