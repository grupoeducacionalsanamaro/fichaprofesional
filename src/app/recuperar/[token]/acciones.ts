"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashearContrasena } from "@/lib/password";
import { validarTokenRecuperacion, marcarTokenUsado } from "@/lib/tokens-acceso";
import { esquemaNuevaContrasena } from "@/lib/validaciones";
import { iniciarSesion } from "@/lib/auth";

export type EstadoRestablecer = { error?: string };

export async function restablecerContrasena(
  _previo: EstadoRestablecer,
  formData: FormData,
): Promise<EstadoRestablecer> {
  const token = String(formData.get("token") ?? "");

  // El token se revalida en el servidor en cada envío: la página cargada antes
  // no es autorización suficiente.
  const fila = await validarTokenRecuperacion(token);
  if (!fila) {
    return { error: "El enlace ya no es válido. Solicita uno nuevo." };
  }

  const analisis = esquemaNuevaContrasena.safeParse({
    contrasena: formData.get("contrasena") ?? "",
    confirmarContrasena: formData.get("confirmarContrasena") ?? "",
  });
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? "Revisa los datos ingresados." };
  }

  const passwordHash = await hashearContrasena(analisis.data.contrasena);

  await prisma.$transaction([
    prisma.profesional.update({ where: { id: fila.profesionalId }, data: { passwordHash } }),
  ]);
  await marcarTokenUsado(fila.id);

  await iniciarSesion(fila.profesionalId);
  redirect("/panel");
}
