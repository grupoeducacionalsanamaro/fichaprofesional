"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { permitir } from "@/lib/rate-limit";
import { crearEnlaceRecuperacion } from "@/lib/tokens-acceso";
import { enviarRecuperacionContrasena } from "@/lib/email";
import { esquemaSolicitarRecuperacion } from "@/lib/validaciones";

export type EstadoSolicitud = { error?: string; enviado?: boolean };

export async function solicitarRecuperacion(
  _previo: EstadoSolicitud,
  formData: FormData,
): Promise<EstadoSolicitud> {
  const analisis = esquemaSolicitarRecuperacion.safeParse({ email: formData.get("email") ?? "" });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Ingresa un correo válido." };
  }
  const { email } = analisis.data;

  const cabeceras = await headers();
  const ip = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  if (!permitir(`recuperar-ip:${ip}`, 6, 10 * 60_000) || !permitir(`recuperar-cuenta:${email}`, 3, 10 * 60_000)) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const profesional = await prisma.profesional.findUnique({
    where: { email },
    select: { id: true, nombreCompleto: true },
  });

  // Misma respuesta exista o no la cuenta: no delata qué correos están registrados.
  if (profesional) {
    const enlace = await crearEnlaceRecuperacion(profesional.id);
    await enviarRecuperacionContrasena({ para: email, nombre: profesional.nombreCompleto, enlace });
  }

  return { enviado: true };
}
