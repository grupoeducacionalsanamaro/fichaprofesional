import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proyecto Vercel independiente. Si más adelante se sirve bajo un subpath
  // de otro dominio (como hace /colaboradores), fijar basePath aquí y en
  // COOKIE de sesión / urlPublica().
  experimental: {
    // Las fotos de perfil se suben a través de una Server Action (máx. 4 MB).
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Nada de esta app debe poder embeberse en un <iframe> ajeno: sin esto,
        // un sitio de terceros podría superponer una capa invisible sobre el
        // panel (clickjacking) para inducir clics en "Publicar mi ficha",
        // "Retirar del directorio" o similares.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
