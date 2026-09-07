import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { permitir } from "@/lib/rate-limit";

/**
 * Rate limit por IP sobre las rutas públicas (directorio y fichas).
 * Ver limitaciones en src/lib/rate-limit.ts.
 */
const LIMITE = 120; // peticiones
const VENTANA_MS = 60_000; // por minuto

export function proxy(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconocida";

  if (!permitir(`publico:${ip}`, LIMITE, VENTANA_MS)) {
    return new NextResponse("Demasiadas solicitudes. Intenta nuevamente en un minuto.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/ficha/:path*"],
};
