import type { MetadataRoute } from "next";

// A diferencia del directorio de colaboradores, esta ficha es un perfil
// profesional público que cada profesional publica para darse a conocer: se
// permite indexación, salvo el panel de administración de cada cuenta.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/panel", "/login", "/registro", "/recuperar", "/verificar", "/c"] },
    ],
  };
}
