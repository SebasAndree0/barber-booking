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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ✅ CSP (permite inline + permite Google Maps iframe)
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' https:; " +
              "font-src 'self' data: https:; " +
              "frame-src 'self' https://www.google.com https://www.google.com.br; " + // ✅ Maps embed
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "frame-ancestors 'none'; " +
              "form-action 'self'; " +
              "upgrade-insecure-requests;",
          },

          // ✅ Anti-clickjacking
          { key: "X-Frame-Options", value: "DENY" },

          // ✅ Evita MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // ✅ Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ✅ Permisos del navegador
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

          // ✅ Cross-Origin hardening (seguro para la mayoría de webs)
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

          // ⚠️ COEP puede romper Google Maps embed y otros recursos externos.
          // Si lo activas y se rompe algo, vuelve a comentarlo.
          // { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;