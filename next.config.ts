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
};

export default nextConfig;
