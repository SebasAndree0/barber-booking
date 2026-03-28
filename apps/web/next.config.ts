// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        // ✅ IMPORTANTE: mantener el path para /services, /barbers, /slots, etc.
        destination: "https://barber-booking-t9e6.onrender.com/api/v1/:path*",
      },
    ];
  },

  async headers() {
    // ✅ RECOMENDADO: en DEV no pongas CSP estricta (evita “se queda pegada” por bloqueos)
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              // Si en algún momento usas Google Maps JS API, necesitarás permitir https://maps.googleapis.com aquí también.
              "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://*.googleapis.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              // ✅ IMPORTANTE: connect-src (API + Google)
              "connect-src 'self' https: http://127.0.0.1:8001 http://localhost:8001 https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com; " +
              "font-src 'self' data: https:; " +
              // ✅ Maps embed (iframe)
              "frame-src 'self' https://www.google.com https://www.google.com.br; " +
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
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },

          // ✅ Cross-Origin hardening
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

          // ⚠️ COEP puede romper Google Maps embed y otros recursos externos.
          // { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;