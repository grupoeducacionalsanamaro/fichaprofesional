"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { iniciarSesion, verificarCredenciales } from "@/lib/auth";
import { permitir } from "@/lib/rate-limit";
import { esquemaAcceso } from "@/lib/validaciones";

export type EstadoAcceso = { error?: string; email?: string };

export async function entrar(_previo: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const analisis = esquemaAcceso.safeParse({
    email: formData.get("email") ?? "",
    contrasena: formData.get("contrasena") ?? "",
  });
  if (!analisis.success) {
    return {
      error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados.",
      email: String(formData.get("email") ?? ""),
    };
  }
  const { email, contrasena } = analisis.data;

  const cabeceras = await headers();
  const ip = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";

  // Dos frenos a la fuerza bruta: por IP (quien lo intenta) y por cuenta (a
  // quién intentan entrar), porque una botnet rota direcciones pero no cuentas.
  const permitidoPorIp = permitir(`login-ip:${ip}`, 10, 10 * 60_000);
  const permitidoPorCuenta = permitir(`login-cuenta:${email}`, 8, 10 * 60_000);
  if (!permitidoPorIp || !permitidoPorCuenta) {
    return {
      error: "Demasiados intentos fallidos. Espera unos minutos antes de volver a probar.",
      email,
    };
  }

  const profesionalId = await verificarCredenciales(email, contrasena);
  if (!profesionalId) {
    // Un solo mensaje para cuenta inexistente y contraseña incorrecta: decir
    // cuál de los dos falló confirmaría qué correos tienen cuenta.
    return { error: "Correo o contraseña incorrectos.", email };
  }

  await iniciarSesion(profesionalId);
  redirect("/panel");
}
